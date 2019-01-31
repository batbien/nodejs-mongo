const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');

mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose,
  ObjectID
}
