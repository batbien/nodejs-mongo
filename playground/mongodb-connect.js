const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);
var obj = new ObjectID();
console.log(obj);
var obj = new ObjectID();
console.log(obj);
var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  if (err)
    return console.log("Cannot connect to MongoDB server: " + err.message);
  console.log("Connected to MongoDB server");

  const db = client.db('TodoApp');
  /*
  db.collection('Todos').insertOne({
    text: "Hello world of collections and  documents and fields",
    foo: "foo field",
    bar: "is bar field allowed?"
  }, (err, result) => {
    if (err)
      return console.log("Unable to insert document: ", err.message);
    else
      console.log(JSON.stringify(result.ops, undefined, 1));
  });
  */

  db.collection('Users').insertOne({
    name: "Hoang Duong Nguyen",
    age: 30,
    location: "Darmstadt",
  }, (err, result) => {
    if (err)
      return console.log("Err: ", err.message);
    console.log("Inserted: ", JSON.stringify(result.ops, undefined, 1));
    console.log("Timestamp: ", result.ops[0]._id.getTimestamp());
  })

  client.close();
});
