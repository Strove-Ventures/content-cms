'use strict';

/**
 * library-content service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::library-content.library-content');
