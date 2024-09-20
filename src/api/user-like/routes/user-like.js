'use strict';

/**
 * user-like router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/user-likes/contents/:contentId/like',
      handler: 'user-like.likeContent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/user-likes/contents/:contentId/unlike',
      handler: 'user-like.unlikeContent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
