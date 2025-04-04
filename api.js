const app = require("./server");  // Import Express app
const serverless = require("serverless-http");

module.exports = serverless(app);
