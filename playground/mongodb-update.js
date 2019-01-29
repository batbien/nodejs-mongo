const {
  MongoClient,
  ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  if (err)
    return console.log("Cannot connect to mongodb server: ", err.message);
  console.log("Connected to mongodb server");
  const db = client.db("TodoApp");
  // db.collection("Users").findOneAndUpdate({
  //   name: "Hoang Duong Nguyen"
  // }, {
  //   $set: {
  //     foo: "bar",
  //     personality: "veryyyyy cool"
  //   },
  //   $rename: {
  //     name: "_name"
  //     // personality: "_personality"
  //   }
  // }, {
  //   returnOriginal: false
  // }).then(
  //   result => {
  //     console.log("Updated: " + JSON.stringify(result, undefined, 1));
  //   },
  //   err => {
  //     console.log("Error by update: ", err.message);
  //   }
  // );

  db.collection('Users').findOneAndUpdate({
      name: "Le Tao Mai"
    }, {
      $inc: {
        age: 6
      }
    },
{
  returnOriginal: false
}
).then(
  result => {
      console.log("Updated: " + JSON.stringify(result, undefined, 1));
    },
    err => {
      console.log("Error by update: ", err.message);
    }
);

  client.close();
});
