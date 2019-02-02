var node_env = process.env.NODE_ENV || "development";
var user = process.env.USER || "heroku";

if (user === "nhd") {
  if (node_env === "test")
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoAppTest";
  else
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoApp";
} else {
  if (node_env === "test")
    process.env.MONGODB_URI = "mongodb://tabneib:foobar123@ds111461.mlab.com:11461/todoapp_tabneib_test"
  else
    process.env.MONGODB_URI = "mongodb://tabneib:foobar123@ds143474.mlab.com:43474/todoapp_tabneib";
}
