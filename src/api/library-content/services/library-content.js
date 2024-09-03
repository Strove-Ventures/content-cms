'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::library-content.library-content', ({ strapi }) => ({
  async incrementLikeCount(id) {
    const entry = await strapi.entityService.findOne('api::library-content.library-content', id, {
      fields: ['like_count'],
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    const likeCount = entry.like_count && !isNaN(entry.like_count) ? parseInt(entry.like_count, 10) : 0;

    const updatedEntry = await strapi.entityService.update('api::library-content.library-content', id, {
      data: {
        like_count: likeCount + 1,
      },
    });

    return updatedEntry;
  },
}));
