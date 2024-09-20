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

    // Parse the subcategories filter
    const subcategoryIds = parseFilter(subcategories);
    if (subcategoryIds.length > 0) {
      filters.subCategories = { id: { $in: subcategoryIds } };  // Use correct camelCase 'subCategories'
      strapi.log.info(`Subcategories filter applied: ${JSON.stringify(filters.subCategories)}`);
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
      populate: ['cover', 'duration', 'points', 'tags', 'category', 'subCategories'],  // Use camelCase 'subCategories'
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
      points: entry.points || null,
      category: entry.category?.name || null,
      subCategories: entry.subCategories ? entry.subCategories.map(sub => sub.name) : [],
      tags: entry.tags ? entry.tags.map(tag => tag.name) : []
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
  async likeContent(ctx) {
    const userId = ctx.state.user?.id;
    const { contentId } = ctx.params;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to like content');
    }

    // Check if the user has already liked the content
    const existingLike = await strapi.db.query('api::user-like.user-like').findOne({
      where: { user: userId, libraryContent: contentId }
    });

    if (existingLike) {
      return ctx.badRequest('You have already liked this content');
    }

    // Create a new like
    const newLike = await strapi.db.query('api::user-like.user-like').create({
      data: {
        user: userId,
        libraryContent: contentId
      }
    });

    // Optionally, you could also increment the like count on the content
    await strapi.db.query('api::library-content.library-content').update({
      where: { id: contentId },
      data: { likeCount: { $increment: 1 } }
    });

    return ctx.send({ data: newLike });
  },
  async unlikeContent(ctx) {
    const userId = ctx.state.user?.id;
    const { contentId } = ctx.params;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to unlike content');
    }

    // Check if the user has liked the content
    const existingLike = await strapi.db.query('api::user-like.user-like').findOne({
      where: { user: userId, libraryContent: contentId }
    });

    if (!existingLike) {
      return ctx.badRequest('You have not liked this content');
    }

    // Remove the like
    await strapi.db.query('api::user-like.user-like').delete({
      where: { id: existingLike.id }
    });

    // Optionally, decrement the like count on the content
    await strapi.db.query('api::library-content.library-content').update({
      where: { id: contentId },
      data: { likeCount: { $decrement: 1 } }
    });

    return ctx.send({ message: 'Content unliked' });
  }



}));
