// ./src/api/library-content/routes/library-content.js

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::library-content.library-content', {
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    findOne: {},
    create: {},
    update: {},
    delete: {},
  },
});
