'use strict';

/**
 * user-like service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-like.user-like');
