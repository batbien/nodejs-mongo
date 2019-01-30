'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const {
  Todo
} = require('./models/todo');
const {
  User
} = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  var todo = new Todo(req.body);
  todo.save((err, doc) => {
    if (err)
      res.status(400).send(err.message);
    res.status(200).send(doc);
  })
})

app.post("/users", (req, res) => {
  var user = new User(req.body)
  user.save((err, doc) => {
    if (err)
      res.status(400).send(err.message);
    res.status(200).send(doc);
  })
})

app.listen(3333, () => {
  console.log("Server listening on port 3333");
});

module.exports = {
  app
}
