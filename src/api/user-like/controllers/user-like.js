'use strict';

/**
 * user-like controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-like.user-like', ({ strapi }) => ({
  async likeContent(ctx) {
    const { contentId } = ctx.params;
    const { userId, organisationId } = ctx.query; // Get userId and organisationId from query

    if (!userId || !organisationId) {
      return ctx.badRequest('User ID and Organisation ID are required');
    }

    // Check if the user has already liked the content within the organization
    const existingLike = await strapi.db.query('api::user-like.user-like').findOne({
      where: { user: userId, libraryContent: contentId, organization: organisationId }
    });

    if (existingLike) {
      return ctx.badRequest('You have already liked this content');
    }

    // Create a new like associated with the user and organization
    const newLike = await strapi.db.query('api::user-like.user-like').create({
      data: {
        user: userId,
        libraryContent: contentId,
        organization: organisationId
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
    const { contentId } = ctx.params;
    const { userId, organisationId } = ctx.query; // Get userId and organisationId from query

    if (!userId || !organisationId) {
      return ctx.badRequest('User ID and Organisation ID are required');
    }

    // Check if the user has liked the content within the organization
    const existingLike = await strapi.db.query('api::user-like.user-like').findOne({
      where: { user: userId, libraryContent: contentId, organization: organisationId }
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
