'use strict';

const expect = require('expect');
const request = require('supertest');

const { ObjectID } = require("../db/mongoose");
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
