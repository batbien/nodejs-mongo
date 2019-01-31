const mongoose = require('mongoose');

mongoose.connect(process.env.USER === "nhd"
? 'mongodb://localhost:27017/TodoApp'
: "mongodb://tabneib:foobar123@ds143474.mlab.com:43474/todoapp_tabneib");

module.exports = {
  mongoose
}
