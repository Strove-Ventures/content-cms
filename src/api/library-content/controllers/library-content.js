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
