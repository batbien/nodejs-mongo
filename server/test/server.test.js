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

//----------------------------------------------------------------------------->
//                                  POST /todos
//<-----------------------------------------------------------------------------

describe('Test POST /todos', () => {
  var text = "third todo";
  it('should return status 200 and correctly add the todo to db', (done) => {
    request(app)
      .post('/todos')
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
      .send({ foo: "foo" })
      .expect(400)
      .expect(res => {
        expect(res.text).toContain("failed");
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

//----------------------------------------------------------------------------->
//                                  GET /todos
//<-----------------------------------------------------------------------------

describe("Test GET /todos", () => {

  it("should return the correct set of todos for the first user", done => {
    request(app)
      .get("/todos")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].text).toBe(todos[0].text);
      })
      .end(done);
  });

});

//----------------------------------------------------------------------------->
//                                  GET /todos/:id
//<-----------------------------------------------------------------------------

describe("Test GET /todos/:id", () => {

  it("should return status 200 & the first todo", done => {
    // Get the id
    var id = todos[0]._id;
    request(app)
      .get(`/todos/${id}`)
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

});

//----------------------------------------------------------------------------->
//                              DELETE /todos/:id
//<-----------------------------------------------------------------------------

describe("Test DELETE /todos/:id", () => {

  it("should return 200 and delete one todo with the given id", (done) => {
    var id = todos[0]._id;
    request(app)
      .delete(`/todos/${id}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        // Deleted the correct todo
        Todo.findById(id).exec()
          .then(todo => {
            expect(todo).toBeFalsy();
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
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
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

//----------------------------------------------------------------------------->
//                              PATCH /todos/:id
//<-----------------------------------------------------------------------------

describe("PATCH /todos/:id", () => {

  it("should return 200 and successfully update the todo", done => {

    var id = todos[0]._id;
    var before = new Date().getTime();
    var text = "patched first todo";
    request(app)
      .patch(`/todos/${id}`)
      .set("x-auth", users[0].tokens[0].token)
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
            expect(todo.completedAt).toBeGreaterThan(before);
            expect(todo.completedAt).toBeLessThan(after);
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
      .set("x-auth", users[0].tokens[0].token)
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

//----------------------------------------------------------------------------->
//                              POST /users
//<-----------------------------------------------------------------------------

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
            var token = jwt.sign({ _id: user.id, access: "auth" }, process.env.JWT_SECRET);
            expect(user).toBeTruthy();
            expect(user.tokens.toObject().filter(t => {
              return t.token === token && t.access == "auth"
            }).length).toBe(1);
            expect(res.header["x-auth"]).toEqual(token);
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

//----------------------------------------------------------------------------->
//                              GET /users/me
//<-----------------------------------------------------------------------------

describe("GET /users/me", () => {

  it("should return 200 and authorize the user", done => {

    var token = users[0].tokens[0].token;
    request(app)
      .get("/users/me")
      .set("x-auth", token)
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        expect(res.body._id).toEqual(users[0]._id.toHexString());
        expect(res.body.email).toEqual(users[0].email);
        expect(res.body.password).toBeFalsy();
        done();
      })

  });

});

//----------------------------------------------------------------------------->
//                              POST /users/login
//<-----------------------------------------------------------------------------

describe("POST /users/login", () => {

  it("should succefully login", done => {
    var email = users[0].email;
    var password = "pwd";
    var token = users[0].tokens[0].token;
    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        expect(res.header["x-auth"]).toEqual(token);
        done();
      });
  });


  it("should succefully login and create an auth token for the user", done => {
    var email = users[1].email;
    var password = "pwd";
    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        // Check if an auth token is created
        User.findById(users[1]._id).then(
            user => {
              var authTokens = user.tokens.filter(t => { return t.access === "auth" });
              expect(authTokens.length).toBe(1);
              expect(res.header["x-auth"]).toEqual(authTokens[0].token);
              done();
            }
          )
          .catch(
            err => { done(err); }
          );
      });
  });


  it("should reject login due to wrong password", done => {
    var email = users[0].email;
    var password = "pwd" + "make it wrong";
    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(401)
      .end((err, res) => {
        if (err)
          return done(err);
        expect(res.header["x-auth"]).toBeFalsy();
        done();
      });
  });

  it("should reject login due to wrong email", done => {
    var email = "makeitwrong" + users[0].email;
    var password = "pwd";
    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(401)
      .end((err, res) => {
        if (err)
          return done(err);
        expect(res.header["x-auth"]).toBeFalsy();
        done();
      });
  });

});

//----------------------------------------------------------------------------->
//                           DELETE /users/me/token
//<-----------------------------------------------------------------------------

describe("DELETE /users/me/token", () => {

  it("should delete the auth token successfully", done => {
    var token = users[0].tokens[0].token;
    request(app)
      .delete("/users/me/token")
      .set("x-auth", token)
      .expect(200)
      .end((err, res) => {
        if (err)
          return done(err);
        User.findById(users[0]._id).then(
            user => {
              expect(user.tokens.filter(t => { return t.token === token }).length).toBe(0);
              done();
            }
          )
          .catch(
            err => { done(err); });
      });
  });

  it("should not logout successfully due to wrong token", done => {
    var token = new ObjectID().toHexString();
    request(app)
      .delete("/users/me/token")
      .set("x-auth", token)
      .expect(401)
      .end((err, res) => {
        if (err)
          return done(err);
        User.find({}).then(
            users => {
              expect(users.filter(u => {
                return (u.tokens.filter(t => { return t.access === "auth" }).length === 1);
              }).length).toBe(1);
              done();
            }
          )
          .catch(
            err => { done(err); });
      });
  });

});
