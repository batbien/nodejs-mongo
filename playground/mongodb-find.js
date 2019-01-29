const {
  MongoClient,
  ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  // if (err)
  //   return console.log("Cannot connect to mongodb server: ", err.message);
  // console.log('Connected to mongodb server.');
  // const db = client.db('TodoApp');
  // db.collection('Todos').find({}).count().then(
  //   (count) => {
  //     console.log("Todos count: ", count);
  //   },
  //   (err) => {
  //     console.log("err by count(): ", err.message);
  //   }
  // );
  //
  // client.close();


  if (err)
    return console.log("Cannot connect to mongodb server: ", err.message);
  console.log("Connected to mongodb server");
  const db = client.db("TodoApp");
  db.collection("Users").find({
    name: "Hoang Duong Nguyen"
  }).count().then(
    count => {
      console.log(`Found ${count} documents`);
    },
    err => {
      console.log("Err by count(): ", err.message);
    }
  );
  client.close();
});
