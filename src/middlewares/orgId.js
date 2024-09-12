// File: ./src/middlewares/orgId.js

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {

    // Ensure that ctx.params exists and has orgId
    if (!ctx || !ctx.params) {
      strapi.log.error('Context (ctx) or ctx.params is undefined!');
      return ctx.throw(500, 'Internal Server Error - Context or Params Missing');
    }

    const orgId = ctx.params.orgId;

    // Log the orgId to check where the issue is
    strapi.log.info(`Received orgId: ${orgId}`);

    if (orgId) {
      ctx.state.orgId = orgId;
    } else {
      strapi.log.error('orgId is missing from the request');
      return ctx.throw(400, 'Organization ID (orgId) is required in the URL.');
    }

    await next();
  };
};
