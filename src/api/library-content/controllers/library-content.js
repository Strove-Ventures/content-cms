const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::library-content.library-content', ({ strapi }) => ({
  async incrementLikeCount(ctx) {
    const { id } = ctx.params;
    const entry = await strapi.db.query('api::library-content.library-content').findOne({
      where: { id },
      select: ['likeCount'],
    });

    if (!entry) return ctx.notFound('Entry not found');

    // Ensure likeCount is initialized and not NaN
    const likeCount = entry.likeCount && !isNaN(entry.likeCount) ? parseInt(entry.likeCount, 10) : 0;

    const updatedEntry = await strapi.db.query('api::library-content.library-content').update({
      where: { id },
      data: { likeCount: likeCount + 1 },
    });

    return ctx.send({ data: updatedEntry });
  },

  async find(ctx) {
    const { category, tags, subcategories } = ctx.query;

    // Initialize filters
    const filters = {};

    // Log the incoming query parameters
    strapi.log.info(`Query params - Category: ${category}, Tags: ${tags}, Subcategories: ${subcategories}`);

    const parseFilter = (filterValue) => {
      if (typeof filterValue === 'string') {
        const cleanedValue = filterValue.replace(/[\[\]\s]/g, '');  // Remove brackets and spaces
        return cleanedValue.split(',').map(Number);  // Split by comma and convert to numbers
      } else if (Array.isArray(filterValue)) {
        return filterValue.map(Number);
      }
      return [];
    };

    // Parse the category filter
    if (category) {
      filters.category = { id: { $eq: Number(category) } };
      strapi.log.info(`Category filter applied: ${JSON.stringify(filters.category)}`);
    }

    // Parse the tags filter
    const tagIds = parseFilter(tags);
    if (tagIds.length > 0) {
      filters.tags = { id: { $in: tagIds } };
      strapi.log.info(`Tags filter applied: ${JSON.stringify(filters.tags)}`);
    }

    // Parse the subcategories filter (correct name)
    const subcategoryIds = parseFilter(subcategories);
    if (subcategoryIds.length > 0) {
      filters.subCategories = { id: { $in: subcategoryIds } };  // Use correct camelCase 'subCategories'
      strapi.log.info(`Subcategories filter applied: ${JSON.stringify(filters.subCategories)}`);
    }

    // Log the final filters
    strapi.log.info(`Final filters applied: ${JSON.stringify(filters)}`);

    // Execute the query with the filters and populate necessary relations
    const entries = await strapi.db.query('api::library-content.library-content').findMany({
      where: filters,
      populate: ['cover', 'duration', 'points', 'tags', 'category', 'subCategories'],  // Use camelCase 'subCategories'
    });

    // Log the number of results
    strapi.log.info(`Number of results: ${entries.length}`);

    // Format the response
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      descriptionShort: entry.descriptionShort,
      descriptionLong: entry.descriptionLong,
      type: entry.type,
      likeCount: entry.likeCount,
      tileType: entry.tileType,
      coverUrl: entry.cover?.url || null,
      duration: entry.duration || null,
      points: entry.points || null,
      category: entry.category?.name || null,
      subCategories: entry.subCategories ? entry.subCategories.map(sub => sub.name) : [],  // Use camelCase 'subCategories'
      tags: entry.tags ? entry.tags.map(tag => tag.name) : [],  // Include tag names
    }));

    return ctx.send({ data: formattedEntries });
  },

  async search(ctx) {
    try {
      const { query, tags, category, subcategory } = ctx.request.query;

      if (!query) {
        return ctx.badRequest('Query parameter is required');
      }

      // Define the searchable fields for the main entity
      const searchableFields = ['title', 'slug', 'descriptionShort', 'descriptionLong', 'tileType', 'type', 'richText'];

      // Create OR conditions for the searchable fields
      const orConditions = searchableFields.map(field => ({
        [field]: { $containsi: query }
      }));

      // Initialize filters for categories, subcategories, and tags
      const filters = {
        $or: orConditions
      };

      // Handle category filtering
      if (category) {
        // Fetch the category and check for 'isDefault'
        const categoryRecord = await strapi.db.query('api::category.category').findOne({
          where: {
            id: category
          }
        });

        // If category exists and is not default, apply the filter
        if (categoryRecord && !categoryRecord.isDefault) {
          filters.category = { id: categoryRecord.id };
        }
        // If isDefault is true, no filter for category is applied (search over all categories)
      }

      // Handle subcategory filtering
      if (subcategory) {
        // Fetch the subcategory and check for 'isDefault'
        const subcategoryRecord = await strapi.db.query('api::subcategory.subcategory').findOne({
          where: {
            id: subcategory
          }
        });

        // If subcategory exists and is not default, apply the filter
        if (subcategoryRecord && !subcategoryRecord.isDefault) {
          filters.subCategories = { id: subcategoryRecord.id };
        }
        // If isDefault is true, no filter for subcategory is applied (search over all subcategories)
      }

      // Handle tags filtering if provided in the URL
      if (tags) {
        const tagIds = tags.split(',').map(Number); // assuming tags are passed as comma-separated IDs
        filters.tags = { id: { $in: tagIds } };
      }

      // Perform the search across fields, categories, subcategories, and tags
      const entries = await strapi.db.query('api::library-content.library-content').findMany({
        where: filters,
        populate: ['cover', 'duration', 'points', 'tags', 'category', 'subCategories']  // Populate necessary relations
      });


      // Format the results to include necessary details
      const formattedEntries = entries.map(entry => ({
        id: entry.id,
        title: entry.title,
        slug: entry.slug,
        descriptionShort: entry.descriptionShort,
        descriptionLong: entry.descriptionLong,
        type: entry.type,
        likeCount: entry.likeCount,
        tileType: entry.tileType,
        coverUrl: entry.cover?.url || null,
        duration: entry.duration || null,
        points: entry.points || null,
        category: entry.category?.name || null,
        subCategories: entry.subCategories ? entry.subCategories.map(sub => sub.name) : [],  // Include subcategory names
        tags: entry.tags ? entry.tags.map(tag => tag.name) : [],  // Include tag names
      }));

      return ctx.send({ data: formattedEntries });
    } catch (error) {
      strapi.log.error('Search error:', error);
      return ctx.internalServerError('Something went wrong during the search');
    }
  },

}));
