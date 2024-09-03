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

      // Get all the non-relation fields of the library-content model
      // const fields = Object.entries(strapi.contentTypes['api::library-content.library-content'].attributes)
      //   .filter(([key, value]) => value.type !== 'relation')
      //   .map(([key]) => key);
      const searchableFields = [
        'title',
        'slug',
        'description_short',
        'description_long',
        'tileType',
        'type',
        'richText'
      ];

      // Build the OR condition dynamically for searchable fields
      const orConditions = searchableFields.map(field => ({
        [field]: { $containsi: query }
      }));

      // Perform the search
      const entries = await strapi.db.query('api::library-content.library-content').findMany({
        where: { $or: orConditions }
      });

      return ctx.send({ data: entries });
    } catch (error) {
      strapi.log.error('Search error:', error);
      return ctx.internalServerError('Something went wrong during the search');
    }
  },
}));
