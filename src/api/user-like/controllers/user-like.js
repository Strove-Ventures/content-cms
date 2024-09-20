'use strict';

/**
 * user-like controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-like.user-like', ({ strapi }) => ({
  async likeContent(ctx) {
    const { userId, contentId, organizationId } = ctx.params; // Take userId and organizationId as params

    // Ensure that both userId and organizationId are provided
    if (!userId || !organizationId) {
      return ctx.badRequest('User ID and Organization ID are required');
    }

    // Check if the user has already liked the content within the organization
    const existingLike = await strapi.db.query('api::user-like.user-like').findOne({
      where: { user: userId, libraryContent: contentId, organization: organizationId }
    });

    if (existingLike) {
      return ctx.badRequest('You have already liked this content');
    }

    // Create a new like associated with the user and organization
    const newLike = await strapi.db.query('api::user-like.user-like').create({
      data: {
        user: userId,
        libraryContent: contentId,
        organization: organizationId
      }
    });

    // Increment the like count on the content
    await strapi.db.query('api::library-content.library-content').update({
      where: { id: contentId },
      data: { likeCount: { $increment: 1 } }
    });

    return ctx.send({ data: newLike });
  },

  async unlikeContent(ctx) {
    const { userId, contentId, organizationId } = ctx.params; // Take userId and organizationId as params

    // Ensure that both userId and organizationId are provided
    if (!userId || !organizationId) {
      return ctx.badRequest('User ID and Organization ID are required');
    }

    // Check if the user has liked the content within the organization
    const existingLike = await strapi.db.query('api::user-like.user-like').findOne({
      where: { user: userId, libraryContent: contentId, organization: organizationId }
    });

    if (!existingLike) {
      return ctx.badRequest('You have not liked this content');
    }

    // Remove the like
    await strapi.db.query('api::user-like.user-like').delete({
      where: { id: existingLike.id }
    });

    // Decrement the like count on the content
    await strapi.db.query('api::library-content.library-content').update({
      where: { id: contentId },
      data: { likeCount: { $decrement: 1 } }
    });

    return ctx.send({ message: 'Content unliked' });
  },
}));
