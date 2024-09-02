// ./src/api/library-content/routes/custom-increment-view.js

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/library-contents/:id/increment-view',
      handler: 'library-content.incrementViewCount',
      config: {
        auth: false,
      },
    },
  ],
};
