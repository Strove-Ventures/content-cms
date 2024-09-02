// ./src/api/library-content/routes/custom-increment-view.js

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/library-contents/:id/increment-like',
      handler: 'library-content.incrementLikeCount',
      config: {
        auth: false,
      },
    },
  ],
};
