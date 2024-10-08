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

  async findOne(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user?.id; // Get the user ID from the authenticated session

    // Fetch the library content by ID
    const entry = await strapi.db.query('api::library-content.library-content').findOne({
      where: { id },
      populate: ['cover', 'duration', 'points', 'tags', 'category', 'subCategories', 'type', 'body', 'richText', 'author'],  // Use camelCase 'subCategories'
    });

    if (!entry) {
      return ctx.notFound('Content not found');
    }

    // If the user is logged in, check if they have liked this content
    let likedByMe = false;
    if (userId) {
      const userLike = await strapi.db.query('api::user-like.user-like').findOne({
        where: { user: userId, libraryContent: id }
      });
      likedByMe = !!userLike; // If the user has liked it, set likedByMe to true
    }

    // Format the response with the "liked by me" status
    const formattedEntry = {
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      descriptionShort: entry.descriptionShort,
      descriptionLong: entry.descriptionLong,
      type: entry.type,
      likeCount: entry.likeCount,
      likedByMe,  // Include liked by me status
      tileType: entry.tileType,
      type: entry.type,
      body: entry.body || null,
      author: entry.author || null,
      coverUrl: entry.cover?.url || null,
      duration: entry.duration || null,
      points: entry.points || null,
      category: entry.category?.id || null,
      subCategories: entry.subCategories ? entry.subCategories.map(sub => sub.id) : null,
      tags: entry.tags ? entry.tags.map(tag => ({ id: tag.id, accent: tag.accent, name: tag.name })) : null,
      richText: entry.richText || null,
      createdAt: entry.createdAt
    };

    return ctx.send({ data: formattedEntry });
  },

  async find(ctx) {
    const { category, tags, subcategories, organization } = ctx.query;
    const userId = ctx.state.user?.id; // Get the user ID from the authenticated session

    // Initialize filters
    const filters = {};

    // Log the incoming query parameters
    strapi.log.info(`Query params - Category: ${category}, Tags: ${tags}, Subcategories: ${subcategories}, Organization: ${organization}`);

    const parseFilter = (filterValue) => {
      if (typeof filterValue === 'string') {
        const cleanedValue = filterValue.replace(/[\[\]\s]/g, '');  // Remove brackets and spaces
        return cleanedValue.split(',').map(Number);  // Split by comma and convert to numbers
      } else if (Array.isArray(filterValue)) {
        return filterValue.map(Number);
      }
      return [];
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
    if (subcategories) {
      const subcategoryIds = parseFilter(subcategories);
      if (subcategoryIds.length > 0) {
        filters.subCategories = { id: { $in: subcategoryIds } };
      }
    }

    // Handle tags filtering
    if (tags) {
      const tagIds = parseFilter(tags);
      if (tagIds.length > 0) {
        filters.tags = { id: { $in: tagIds } };
      }
    }

    // Parse the organization filter
    if (organization) {
      filters.organization = { id: { $eq: Number(organization) } };  // Filter by organization
      strapi.log.info(`Organization filter applied: ${JSON.stringify(filters.organization)}`);
    }

    // Log the final filters
    strapi.log.info(`Final filters applied: ${JSON.stringify(filters)}`);

    // Fetch the library contents with the filters
    const entries = await strapi.db.query('api::library-content.library-content').findMany({
      where: filters,
      populate: ['cover', 'duration', 'points', 'tags', 'category', 'subCategories', 'type'],  // Use camelCase 'subCategories'
    });

    // If the user is logged in, check if they have liked each content
    let likedContentIds = [];
    if (userId) {
      const userLikes = await strapi.db.query('api::user-like.user-like').findMany({
        where: { user: userId },
        select: ['libraryContent']
      });
      likedContentIds = userLikes.map(like => like.libraryContent.id); // Extract the content IDs that the user liked
    }

    // Format the results with the "liked by me" status
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      descriptionShort: entry.descriptionShort,
      descriptionLong: entry.descriptionLong,
      type: entry.type,
      likeCount: entry.likeCount,
      likedByMe: likedContentIds.includes(entry.id) || false,  // Check if the user has liked this content
      tileType: entry.tileType,
      coverUrl: entry.cover?.url || null,
      duration: entry.duration || null,
      type: entry.type,
      points: entry.points || null,
      category: entry.category?.id || null,
      subCategories: entry.subCategories ? entry.subCategories.map(sub => sub.id) : null,
      tags: entry.tags ? entry.tags.map(tag => tag.id) : null
    }));

    return ctx.send({ data: formattedEntries });
  },

  async search(ctx) {
    try {
      const { query, tags, category, subcategory } = ctx.request.query;
      const userId = ctx.state.user?.id; // Get the user ID from the authenticated session

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

      const parseFilter = (filterValue) => {
        if (typeof filterValue === 'string') {
          const cleanedValue = filterValue.replace(/[\[\]\s]/g, '');  // Remove brackets and spaces
          return cleanedValue.split(',').map(Number);  // Split by comma and convert to numbers
        } else if (Array.isArray(filterValue)) {
          return filterValue.map(Number);
        }
        return [];
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
        const subcategoryIds = parseFilter(subcategory);
        if (subcategoryIds.length > 0) {
          filters.subCategories = { id: { $in: subcategoryIds } };
        }
      }

      // Handle tags filtering
      if (tags) {
        const tagIds = parseFilter(tags);
        if (tagIds.length > 0) {
          filters.tags = { id: { $in: tagIds } };
        }
      }

      // Perform the search across fields, categories, subcategories, and tags
      const entries = await strapi.db.query('api::library-content.library-content').findMany({
        where: filters,
        populate: ['cover', 'duration', 'points', 'tags', 'category', 'subCategories', 'type', 'body'],
      });

      // If the user is logged in, check if they have liked each content
      let likedContentIds = [];
      if (userId) {
        const userLikes = await strapi.db.query('api::user-like.user-like').findMany({
          where: { user: userId },
          select: ['libraryContent']
        });
        likedContentIds = userLikes.map(like => like.libraryContent.id); // Extract the content IDs that the user liked
      }

      // Format the results to include necessary details and 'liked by me' status
      const formattedEntries = entries.map(entry => ({
        id: entry.id,
        title: entry.title,
        slug: entry.slug,
        descriptionShort: entry.descriptionShort,
        descriptionLong: entry.descriptionLong,
        type: entry.type,
        likeCount: entry.likeCount,
        likedByMe: likedContentIds.includes(entry.id) || false,  // Check if the user has liked this content
        tileType: entry.tileType,
        type: entry.type,
        coverUrl: entry.cover?.url || null,
        duration: entry.duration || null,
        points: entry.points || null,
        category: entry.category?.id || null,
        subCategories: entry.subCategories ? entry.subCategories.map(sub => sub.id) : null,  // Include subcategory names
        tags: entry.tags ? entry.tags.map(tag => tag.id) : null,  // Include tag names
      }));

      return ctx.send({ data: formattedEntries });
    } catch (error) {
      strapi.log.error('Search error:', error);
      return ctx.internalServerError('Something went wrong during the search');
    }
  },
}));
