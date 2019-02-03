
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {poolSize: 10});

module.exports = {
  mongoose
}
