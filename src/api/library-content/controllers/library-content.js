const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::library-content.library-content', ({ strapi }) => ({
  async incrementLikeCount(ctx) {
    const { id } = ctx.params;
    const entry = await strapi.db.query('api::library-content.library-content').findOne({
      where: { id },
      select: ['like_count'],
    });

    if (!entry) return ctx.notFound('Entry not found');

    // Ensure like_count is initialized and not NaN
    const likeCount = entry.like_count && !isNaN(entry.like_count) ? parseInt(entry.like_count, 10) : 0;

    const updatedEntry = await strapi.db.query('api::library-content.library-content').update({
      where: { id },
      data: { like_count: likeCount + 1 },
    });

    return ctx.send({ data: updatedEntry });
  },

  async find(ctx) {
    const { category, tags, subcategories } = ctx.query;

    // Initialize filters
    const filters = {};

    // Log the incoming query parameters
    strapi.log.info(`Query params - Category: ${category}, Tags: ${tags}, Subcategories: ${subcategories}`);

    /**
     * Helper function to parse parameters that could be:
     * - An array
     * - A comma-separated string
     * - A single value
     */
    const parseFilter = (filterValue) => {
      if (Array.isArray(filterValue)) {
        // If it's already an array (e.g., [5,7])
        return filterValue.map(Number);  // Convert to numbers
      } else if (typeof filterValue === 'string') {
        // If it's a comma-separated string or single value (e.g., "5,7" or "5")
        return filterValue.split(',').map(Number);  // Split by comma and convert to numbers
      } else if (typeof filterValue === 'number') {
        // If it's a single number
        return [filterValue];
      }
      return [];
    };

    // Parse the category filter (assuming category is a single value)
    if (category) {
      filters.category = { id: { $eq: Number(category) } };  // Make sure category is treated as a number
      strapi.log.info(`Category filter applied: ${JSON.stringify(filters.category)}`);
    }

    // Parse the tags filter using the helper function
    const tagIds = parseFilter(tags);
    if (tagIds.length > 0) {
      filters.tags = { id: { $in: tagIds } };
      strapi.log.info(`Tags filter applied: ${JSON.stringify(filters.tags)}`);
    }

    // Parse the subcategories filter using the helper function
    const subcategoryIds = parseFilter(subcategories);
    if (subcategoryIds.length > 0) {
      filters.subcategories = { id: { $in: subcategoryIds } };
      strapi.log.info(`Subcategories filter applied: ${JSON.stringify(filters.subcategories)}`);
    }

    // Log the final filters before the query
    strapi.log.info(`Final filters applied: ${JSON.stringify(filters)}`);

    // Execute the query with the filters and populate necessary relations
    const entries = await strapi.db.query('api::library-content.library-content').findMany({
      where: filters,
      populate: ['cover', 'duration', 'points', 'tags', 'category', 'subcategories'],  // Populate necessary relations
    });

    // Log the number of results returned
    strapi.log.info(`Number of results: ${entries.length}`);

    // Format the response to include relevant fields and relations
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      description_short: entry.description_short,
      description_long: entry.description_long,
      type: entry.type,
      like_count: entry.like_count,
      tileType: entry.tileType,
      cover_url: entry.cover?.url || null,
      duration: entry.duration || null,
      points: entry.points || null,
      category: entry.category?.name || null,
      subcategories: entry.subcategories ? entry.subcategories.map(sub => sub.name) : [],
      tags: entry.tags ? entry.tags.map(tag => tag.name) : [],  // Include tag names
    }));

    strapi.log.info('Formatted entries ready for response.');

    return ctx.send({ data: formattedEntries });
  },

  async search(ctx) {
    try {
      const { query } = ctx.request.query;

      if (!query) {
        return ctx.badRequest('Query parameter is required');
      }

      // Define the searchable fields for the main entity
      const searchableFields = ['title', 'slug', 'description_short', 'description_long', 'tileType', 'type', 'richText'];

      // Create OR conditions for the searchable fields
      const orConditions = searchableFields.map(field => ({
        [field]: { $containsi: query }
      }));

      // Perform the search and add filtering for the tags relation
      const entries = await strapi.db.query('api::library-content.library-content').findMany({
        where: {
          $or: orConditions,  // Search across the library-content fields
          tags: { name: { $containsi: query } },  // Perform partial match search on tags
        },
        populate: ['cover', 'duration', 'points', 'tags'],  // Ensure tags and other relations are populated
      });

      // If entries were not found via direct relation filtering, perform a manual search in tags
      if (entries.length === 0) {
        const tagEntries = await strapi.db.query('api::tag.tag').findMany({
          where: { name: { $containsi: query } },
          populate: { library_contents: true },  // Populate related library_contents
        });

        console.log('Tag entries:', tagEntries);

        // Safeguard: check if there are any related library_contents
        const relatedLibraryContentIds = tagEntries.flatMap(tag => tag.library_contents ? tag.library_contents.map(lc => lc.id) : []);

        console.log('Related library content IDs:', relatedLibraryContentIds);

        // If there are no related contents, return an empty result
        if (relatedLibraryContentIds.length === 0) {
          return ctx.send({ data: [] });
        }

        // Fetch the matching library content entries using their IDs
        const entriesFromTags = await strapi.db.query('api::library-content.library-content').findMany({
          where: { id: { $in: relatedLibraryContentIds } },
          populate: ['cover', 'duration', 'points', 'tags'],  // Populate necessary relations
        });

        return ctx.send({ data: entriesFromTags });
      }

      // Format the results to include necessary details
      const formattedEntries = entries.map(entry => ({
        id: entry.id,
        title: entry.title,
        slug: entry.slug,
        description_short: entry.description_short,
        description_long: entry.description_long,
        type: entry.type,
        like_count: entry.like_count,
        tileType: entry.tileType,
        cover_url: entry.cover?.url || null,
        duration: entry.duration || null,
        points: entry.points || null,
        tags: entry.tags ? entry.tags.map(tag => tag.name) : [],  // Include tag names in the result
      }));

      return ctx.send({ data: entries });
    } catch (error) {
      strapi.log.error('Search error:', error);
      return ctx.internalServerError('Something went wrong during the search');
    }
  },
}));
