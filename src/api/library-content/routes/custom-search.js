// ./src/api/library-content/routes/custom-search.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/library-contents/search',
      handler: 'library-content.search',
      config: {
        auth: false,
      },
    },
  ],
};
