// ./src/api/library-content/services/library-content.js

'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::library-content.library-content', ({ strapi }) => ({
  async incrementViewCount(id) {
    const entry = await strapi.entityService.findOne('api::library-content.library-content', id, {
      fields: ['view_count'],
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    const updatedEntry = await strapi.entityService.update('api::library-content.library-content', id, {
      data: {
        view_count: parseInt(entry.view_count, 10) + 1,
      },
    });

    return updatedEntry;
  },
}));
