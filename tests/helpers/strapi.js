const Strapi = require("@strapi/strapi");
const fs = require("fs");

let instance;

async function setupStrapi() {
  if (!instance) {
    instance = await Strapi().load();
    await instance.server.mount();
  }
  return instance;
}

async function cleanupStrapi() {
  const dbSettings = strapi.config.get("database.connection");

  // Close server to release the DB file
  if (strapi.server.httpServer) {
    await strapi.server.httpServer.close();
  }

  // Close the database connection
  if (strapi.db.connection) {
    await strapi.db.connection.destroy();
  }

  // Delete the test database after all tests have completed
  if (dbSettings && dbSettings.connection && dbSettings.connection.filename) {
    const tmpDbFile = dbSettings.connection.filename;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
}

module.exports = { setupStrapi, cleanupStrapi };
