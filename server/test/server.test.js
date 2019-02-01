'use strict';

const expect = require('expect');
const request = require('supertest');
const _ = require("lodash");

const { ObjectID } = require("mongodb");
const { app } = require("../server");
const { Todo } = require('../models/todo');

beforeEach("Clearing todos collection", (done) => {
  Todo.deleteMany({}).then(() => done());
});

describe('Test POST /todos', () => {
  var text = "foo";

  it('should return status 200 and correctly add the todo to db', (done) => {
    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body).toInclude({ text })
      })
      .end((err, res) => {
        if (err)
          return done(err);
        // Test the database
        Todo.find({}).exec((err, todos) => {
          if (err)
            return done(err);
          expect(todos.length).toBe(1);
          expect(todos[0].text).toEqual(text);
          done();
        });
      });
  });

  it("should return status 400 and not add the todo to db", (done) => {
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
          expect(todos.length).toBe(0);
          done();
        });
      });
  });
});

describe("Test GET /todos", () => {

  it("should return the correct set of todos", done => {
    // First init the todos collection
    Todo.insertMany([
        { text: "foo" },
        { text: "bar" }
      ]).then(() => {
        request(app)
          .get("/todos")
          .expect(200)
          .expect(res => {
            expect(res.body.length).toBe(2);
            expect(res.body[0].text).toBe("foo");
            expect(res.body[1].text).toBe("bar");
          })
          .end(done);
      })
      .catch(e => {
        done(e);
      });
  });

});

describe("Test GET /todos/:id", () => {

  it("should return status 200 & the correct todo", done => {
    // First init the todos collection
    var text = "foo";
    new Todo({ text }).save()
      .then(() => {
        // Get the id
        Todo.find({ text })
          .exec()
          .then(todos => {
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
          })
          .catch(e => {
            done(e);
          });
      })
      .catch(err => done(err));
  });

  it("should return status 404 & the correct todo", done => {
    // First init the todos collection
    var text = "foo";
    var id = 1234;
    var id_ = new ObjectID(4321).toHexString();
    new Todo({ text, id }).save()
      .then(() => {
        // Get the id
        request(app)
          .get(`/todos/${id_}`)
          .expect(404)
          .end((err, res) => {
            if (err)
              return done(err);
            done();
          });
      })
      .catch(err => done(err));
  });

});

describe("DELETE /todos/:id", () => {

  it("should return 200 and delete one todo with the given id", (done) => {
    var _id = new ObjectID(1234).toHexString();
    var text = "foo";
    new Todo({ text, _id }).save()
      .then(_ => {
        request(app)
          .delete(`/todos/${_id}`)
          .expect(200)
          .end((err, res) => {
            if (err)
              return done(err);
            expect(res.body._id).toBe(_id);
            // Deleted the correct todo
            Todo.findById(_id).exec()
              .then(todo => {
                expect(todo).toNotExist();
                return done();
              })
              .catch(err => {
                done(err);
              });
          });
      })
      .catch(err => {
        done(err);
      });
  });

  it("should return 400 and not delete any todo", (done) => {
    var _id = new ObjectID(1234).toHexString();
    var text = "foo";
    new Todo({ text, _id }).save()
      .then(_ => {
        request(app)
          .delete(`/todos/${_id + "BAA"}`)
          .expect(400)
          .end((err, res) => {
            if (err)
              return done(err);
            // No todo deleted
            Todo.find({}).exec()
              .then(todos => {
                expect(todos.length).toBe(1);
                done();
              })
              .catch(err => {
                done(err);
              });
          });
      })
      .catch(err => {
        done(err);
      });
  });

  it("should return 404 and not delete any todo", (done) => {
    var _id = new ObjectID(1234).toHexString();
    var _id_ = new ObjectID(4321).toHexString();
    var text = "foo";
    new Todo({ text, _id }).save()
      .then(_ => {
        request(app)
          .delete(`/todos/${_id_}`)
          .expect(404)
          .end((err, res) => {
            if (err)
              return done(err);
            // No todo deleted
            Todo.find({}).exec()
              .then(todos => {
                expect(todos.length).toBe(1);
                done();
              })
              .catch(err => {
                done(err);
              });
          });
      })
      .catch(err => done(err));
  });


});


describe("PATCH /todos/:id", () => {

  it("should return 200 and successfully update the todo", done => {
    // First init the collection
    var _id = new ObjectID(1234).toHexString();
    var text = "foo";
    var before = new Date().getTime();
    new Todo({ text, _id }).save()
      .then(() => {
        request(app)
          .patch(`/todos/${_id}`)
          .send({
            text: "bar",
            completed: true
          })
          .expect(200)
          .end((err, res) => {
            if (err)
              return done(err);
            expect(res.body._id).toBe(_id);
            // Updated the correct todo correctly
            Todo.findById(_id).exec()
              .then(todo => {
                var after = new Date().getTime();
                expect(_.pick(todo, ["text", "completed"]))
                  .toEqual({
                    text: "bar",
                    completed: true
                  });
                expect(todo.completedAt).toBeGreaterThan(before).toBeLessThan(after);
                return done();
              })
              .catch(err => {
                done(err);
              });
          });
      })
      .catch(err => {
        done(err);
      });
  });


    it("should return 400 and not update the todo", done => {
      // First init the collection
      var _id = new ObjectID(1234).toHexString();
      var text = "foo";
      new Todo({ text, _id }).save()
        .then(() => {
          request(app)
            .patch(`/todos/${_id}`)
            .send({
              text: "bar",
              completed: "invalid"
            })
            .expect(400)
            .end((err, res) => {
              if (err)
                return done(err);
              // Not update the todo
              Todo.findById(_id).exec()
                .then(todo => {
                  expect(_.pick(todo, ["text", "completed", "completedAt"]))
                    .toEqual({
                      text: "foo",
                      completed: false,
                      completedAt: null
                    });
                  return done();
                })
                .catch(err => {
                  done(err);
                });
            });
        })
        .catch(err => {
          done(err);
        });
    });

});
