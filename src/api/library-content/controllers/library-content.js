const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::library-content.library-content', ({ strapi }) => ({
  async incrementViewCount(ctx) {
    const { id } = ctx.params;
    const entry = await strapi.db.query('api::library-content.library-content').findOne({ where: { id }, select: ['view_count'] });
    if (!entry) return ctx.notFound('Entry not found');
    const updatedEntry = await strapi.db.query('api::library-content.library-content').update({ where: { id }, data: { view_count: parseInt(entry.view_count, 10) + 1 } });
    return ctx.send({ data: updatedEntry });
  },
}));
