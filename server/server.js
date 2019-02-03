'use strict';

require('../config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require("mongodb");
const _ = require("lodash");

require("./db/mongoose");
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require("./middlewares/authenticate");

const app = express();

app.use(bodyParser.json());

//----------------------------------------------------------------------------->
//                                  TODOS
//<-----------------------------------------------------------------------------

app.post("/todos", authenticate, (req, res) => {
  var todo = new Todo(req.body);
  todo._owner = req.user._id;
  todo.save((err, doc) => {
    if (err)
      return res.status(400).send(err.message);
    res.status(200).send(doc);
  })
})

// Get all the todos
app.get("/todos", authenticate, (req, res) => {
  var _owner = req.user._id;
  Todo.find({ _owner }).exec((err, todos) => {
    if (err)
      res.status(500).send(err.message);
    res.send(todos);
  });
})

// Get one todo with the given id
app.get("/todos/:id", authenticate, (req, res) => {
  var _owner = req.user._id;
  Todo.findById(req.params.id)
    .then(todo => {
      if (!todo)
        return res.status(404).send(`No todo with id = ${req.params.id} found`);
      if (todo._owner.toHexString() === _owner.toHexString())
        return res.send(todo);
      res.status(401).send("Unauthorized request");
    })
    .catch(e => {
      res.status(400).send(e.message);
    });
});

// Delete the todo with the given id
app.delete("/todos/:id", authenticate, (req, res) => {
  var _owner = req.user._id;
  // Get the id
  var _id = req.params.id;

  // Validate the id
  if (!ObjectID.isValid(_id))
    return res.status(400).send("Invalid ID");

  // Delete and response
  Todo.findOneAndDelete({ _id, _owner }).exec()
    .then(todo => {
      if (!todo)
        return res.status(404).send(`No todo with id = ${_id} found`);
      res.send(todo);
    })
    .catch(err => {
      res.status(500).send("Server error");
    });
});


// Update the todo with the given id
app.patch("/todos/:id", authenticate, (req, res) => {
  var _owner = req.user._id;
  var _id = req.params.id;
  var update = _.pick(req.body, ["text", "completed"]);

  if (!ObjectID.isValid(_id))
    return res.status(400).send("Invalid ID");

  // Prepare data for updating
  if (_.isBoolean(update.completed) && update.completed)
    update.completedAt = new Date().getTime();
  else if (_.isBoolean(update.completed) && !update.completed)
    update.completedAt = null;
  else
    return res.status(400).send("completed: Invalid value");
  // Update the todo
  Todo.findOneAndUpdate({ _id, _owner }, { $set: update }, { new: true }).exec()
    .then(updatedTodo => {
      if (!updatedTodo)
        return res.status(404).send(`No todo with id = ${_id} found`);
      res.send(updatedTodo);
    })
    .catch(err => {
      res.status(500).send("Server error");
    });

})

//----------------------------------------------------------------------------->
//                                  USERS
//<-----------------------------------------------------------------------------


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

app.post("/users/login", (req, res) => {
  var credential = _.pick(req.body, ["email", "password"]);
  User.findByCredential(credential)
    .then(user => {
      var authTokens = user.tokens.filter(t => { return t.access === "auth"; });
      // console.log("authTokens: ", authTokens);
      if (authTokens.length >= 1)
        return res.header("x-auth", authTokens[0].token).send("Login successful");
      else
        user.generateAuthToken().then(
          token => {
            return res.header("x-auth", token).send("Login successful");
          }
        );
    })
    .catch(err => {
      res.status(401).send("Login failed");
    });
})

app.delete("/users/me/token", authenticate, (req, res) => {
  var user = req.user;
  var token = req.token;
  user.removeToken(token)
    .then(() => {
      res.send("Logout successfully");
    })
    .catch(
      err => {
        console.log("err: ", err);
        res.status(400).send();
      }
    );
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

module.exports = {
  app
}
