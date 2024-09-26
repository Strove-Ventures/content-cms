'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::library-content.library-content', ({ strapi }) => ({
  async incrementLikeCount(id) {
    // const entry = await strapi.documents('api::library-content.library-content').findOne({
    //   documentId: "__TODO__",
    //   fields: ['like_count']
    // });

    // if (!entry) {
    //   throw new Error('Entry not found');
    // }

    // const likeCount = entry.like_count && !isNaN(entry.like_count) ? parseInt(entry.like_count, 10) : 0;

    // const updatedEntry = await strapi.documents('api::library-content.library-content').update({
    //   documentId: "__TODO__",

    //   data: {
    //     like_count: likeCount + 1,
    //   }
    // });

    // return updatedEntry;
  },
}));
