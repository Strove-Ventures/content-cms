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
}));
