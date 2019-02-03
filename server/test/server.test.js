'use strict';

const expect = require('expect');
const request = require('supertest');
const _ = require("lodash");
const jwt = require("jsonwebtoken");

const { ObjectID } = require("mongodb");
const { app } = require("../server");
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { todos, populateTodos, users, populateUsers } = require("./seed");

beforeEach("Clearing todos collection", (done) => {
  var pTodos = populateTodos();
  var pUsers = populateUsers();
  Promise.all([pTodos, pUsers]).then(() => { done(); })
    .catch(err => { done(err); });
});

describe('Test POST /todos', () => {
  var text = "third todo";
  it('should return status 200 and correctly add the todo to db', (done) => {
    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        // Test the database
        Todo.find({}).exec((err, todos) => {
          if (err)
            return done(err);
          expect(todos.length).toBe(3);
          expect(todos[2].text).toEqual(text);
          done();
        });
      });
  });

  it("should return status 400 and NOT add the todo to db", (done) => {
    request(app)
      .post('/todos')
      .send({ foo: "foo" })
      .expect(400)
      .expect(res => {
        expect(res.text).toInclude("failed");
      })
      .end((err, res) => {
        if (err)
          return done(err);
        // Check the database
        Todo.find({}).exec((err, todos) => {
          if (err)
            return done(err);
          expect(todos.length).toBe(2);
          done();
        });
      });
  });
});

describe("Test GET /todos", () => {

  it("should return the correct set of todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.length).toBe(todos.length);
        for (var i = 0; i < res.body.length; i++)
          expect(res.body[i].text).toBe(todos[i].text);
      })
      .end(done);
  });

});

describe("Test GET /todos/:id", () => {

  it("should return status 200 & the correct todo", done => {
    // Get the id
    var id = todos[0]._id;
    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        expect(res.body._id).toEqual(id);
        expect(res.body.text).toEqual(todos[0].text);
        expect(res.body.completed).toEqual(todos[0].completed);
        expect(res.body.completedAt).toEqual(todos[0].completedAt);
        done();
      });
  });

  it("should return status 404", done => {
    request(app)
      .get(`/todos/${new ObjectID()}`)
      .expect(404)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

});

describe("DELETE /todos/:id", () => {

  it("should return 200 and delete one todo with the given id", (done) => {
    var id = todos[0]._id;
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        // Deleted the correct todo
        Todo.findById(id).exec()
          .then(todo => {
            expect(todo).toNotExist();
            return done();
          })
          .catch(err => {
            done(err);
          });
      });
  });

  it("should return 400 and not delete any todo", (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString() + "BAA"}`)
      .expect(400)
      .end((err, res) => {
        if (err)
          return done(err);
        // No todo deleted
        Todo.find({}).exec()
          .then(todos => {
            expect(todos.length).toBe(todos.length);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });

  it("should return 404 and not delete any todo", (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end((err, res) => {
        if (err)
          return done(err);
        // No todo deleted
        Todo.find({}).exec()
          .then(todos => {
            expect(todos.length).toBe(todos.length);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
  });


});


describe("PATCH /todos/:id", () => {

  it("should return 200 and successfully update the todo", done => {

    var id = todos[0]._id;
    var before = new Date().getTime();
    var text = "patched first todo";
    request(app)
      .patch(`/todos/${id}`)
      .send({ text, completed: true })
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        // Updated the correct todo correctly
        Todo.findById(id).exec()
          .then(todo => {
            var after = new Date().getTime();
            expect(_.pick(todo, ["text", "completed"]))
              .toEqual({ text, completed: true });
            expect(todo.completedAt).toBeGreaterThan(before).toBeLessThan(after);
            return done();
          })
          .catch(err => {
            done(err);
          });
      });
  });


  it("should return 400 and not update the todo", done => {
    var id = todos[0]._id;
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text: "bar",
        completed: "invalid"
      })
      .expect(400)
      .end((err, res) => {
        if (err)
          return done(err);
        // Not update the todo
        Todo.findById(id).exec()
          .then(todo => {
            expect(_.pick(todo, ["text", "completed", "completedAt"]))
              .toEqual({
                text: "first todo",
                completed: false,
                completedAt: null
              });
            return done();
          })
          .catch(err => {
            done(err);
          });
      });
  });

});


describe("POST /users", () => {

  it("should return 200 with the correct token and add new user", done => {
    var email = "foobar@foobar.com";
    var password = "123456";
    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        // Get the newly added user
        User.findOne({ email }).exec()
          .then(user => {
            expect(user).toExist();
            expect(user.tokens.access).toEqual("auth");
            expect(user.tokens.token)
              .toEqual(jwt.sign({ _id: user.id, access: "auth" }, "foobar"));
            expect(res.header["x-auth"]).toEqual(user.tokens.token);
            done();
          })
          .catch(err => { done(err); });
      })
  });

  it("should return 400 and not add any user", done => {
    var email = "foobar@foobar";
    var password = "123";
    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      .end((err, res) => {
        if (err)
          return done(err);
        // Get the newly added user
        User.find({}).exec()
          .then(users => {
            expect(users.length).toBe(users.length);
            done();
          })
          .catch(err => { done(err); });
      })
  });

});

describe("GET /users/me", () => {

  it("should return 200 and authorize the user", done => {

    var token = users[0].tokens.token;
    request(app)
      .get("/users/me")
      .set("x-auth", token)
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        expect(res.body._id).toEqual(users[0]._id);
        expect(res.body.email).toEqual(users[0].email);
        expect(res.body.password).toNotExist();
        done();
      })

  });


});
