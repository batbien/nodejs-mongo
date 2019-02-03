'use strict';

require('../config.js');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require("mongodb");
const _ = require("lodash");

const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require("./middlewares/authenticate");

const app = express();
const port = process.env.PORT || 3333;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  var todo = new Todo(req.body);
  todo.save((err, doc) => {
    if (err)
      return res.status(400).send(err.message);
    res.status(200).send(doc);
  })
})

// Get all the todos
app.get("/todos", (req, res) => {
  Todo.find({}).exec((err, todos) => {
    if (err)
      res.status(500).send(err.message);
    res.send(todos);
  });
})

// Get one todo with the given id
app.get("/todos/:id", (req, res) => {
  Todo.findById(req.params.id)
    .then(todo => {
      if (!todo)
        return res.status(404).send(`No todo with id = ${req.params.id} found`);
      res.send(todo);
    })
    .catch(e => {
      res.status(400).send(e.message);
    });
});

// Delete the todo with the given id
app.delete("/todos/:id", (req, res) => {
  // Get the id
  var id = req.params.id;

  // Validate the id
  if (!ObjectID.isValid(id))
    return res.status(400).send("Invalid ID");

  // Delete and response
  Todo.findByIdAndDelete(id).exec()
    .then(todo => {
      if (!todo)
        return res.status(404).send(`No todo with id = ${id} found`);
      res.send(todo);
    })
    .catch(e => {
      res.status(500).send(e.message);
    });
});


// Update the todo with the given id
app.patch("/todos/:id", (req, res) => {
  var id = req.params.id;
  var update = _.pick(req.body, ["text", "completed"]);

  if (!ObjectID.isValid(id))
    return res.status(400).send("Invalid ID");

  if (_.isBoolean(update.completed) && update.completed)
    update.completedAt = new Date().getTime();
  else if (_.isBoolean(update.completed) && !update.completed)
    update.completedAt = null;
  else
    return res.status(400).send("completed: Invalid value");

  // Update the todo
  Todo.findByIdAndUpdate(id, { $set: update }, { new: true }).exec()
    .then(updatedTodo => {
      if (!updatedTodo)
        return res.status(404).send(`No todo with id = ${id} found`);
      res.send(updatedTodo);
    })
    .catch(err => {
      res.status(500).send("Server error");
    });

})


app.post("/users", (req, res) => {
  var user = new User(req.body);
  user.save().then(
      () => { return user.generateAuthToken() })
    .then(
      token => { res.header("x-auth", token).send(user); }
    )
    .catch(
      err => {
        res.status(400).send(err.message);
      }
    );
});


app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


app.post("/users/login", (req, res) => {
  var credential = _.pick(req.body, ["email", "password"]);
  User.findByCredential(credential)
    .then(user => {
      res.header("x-auth", user.tokens.token).send("Login successful");
    })
    .catch(err => {
      res.status(401).send("Login failed");
    });
})

module.exports = {
  app
}
