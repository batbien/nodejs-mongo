const {
  MongoClient,
  ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  if (err)
    return console.log("Cannot connect to mongodb server: ", err.message);
  console.log("Connected to mongodb server.");
  const db = client.db('TodoApp');

  // Delete all foo Users
  db.collection('Users').removeMany({name: "foo"}).then(
    (result) => {console.log("Number of foo users deleted: ", JSON.stringify(result));},
    (err) => {console.log("err by removing foo users: ", err.message);}
  );

  // Delete one user named bar
  db.collection('Users').removeOne({name: "bar"}).then(
    (result) => {console.log("removed one bar user: ", JSON.stringify(result));},
    (err) => {console.log("err by removing bar user: ", err.message);}
  );

  // Find and delete user named Hoang Duong Nguyen
  db.collection('Users').findOneAndDelete({name: 'Hoang Duong Nguyen'}).then(
    (result) => {console.log("Deleted \n", JSON.stringify(result, undefined, 1));},
    (err) => {console.log("err by find One and delete: ", err.message);}
  )

  client.close();
})
