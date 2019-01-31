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

// Get all the todos
app.get("/todos", (req, res) => {
  Todo.find({}).exec((err, todos) => {
    if (err)
      res.status(500).send(err.message);
    res.status(200).send(todos);
  });
})

// Get one todo with the given id
app.get("/todos/:id", (req, res) => {
  Todo.findById(req.params.id)
    .then(todo => {
      if (!todo)
        res.status(404).send(`No todo with id = ${req.params.id} found`);
      res.send(todo);
    })
    .catch(e => {
      res.status(400).send(e.message);
    });
  });

app.listen(3333, () => {
  console.log("Server listening on port 3333");
});

module.exports = {
  app
}
