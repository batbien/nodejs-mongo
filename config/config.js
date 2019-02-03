var node_env = process.env.NODE_ENV;


if (node_env === "development" || node_env === "test") {
  var config = require("./config.json");
  Object.keys(config[node_env]).forEach(key => {
    process.env[key] = config[node_env][key];
  });
} 
