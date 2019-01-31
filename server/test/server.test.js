'use strict';

const expect = require('expect');
const request = require('supertest');

const {db} = require("../db/mongoose");
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
    new Todo({ text: "foo" }).save().then().catch(err => done(err));
    new Todo({ text: "bar" }).save().then().catch(err => done(err));

    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.length).toBe(2);
        expect(res.body[0].text).toBe("foo");
        expect(res.body[1].text).toBe("bar");
      })
      .end(done);
  });
});
