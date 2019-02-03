const { Todo } = require("../models/todo");
const { User } = require("../models/user");
const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const todos = [{
    _id: new ObjectID().toHexString(),
    text: "first todo",
    completed: false,
    completedAt: null
  },
  {
    _id: new ObjectID().toHexString(),
    text: "second todo",
    completed: false,
    completedAt: null
  }
];

var fooId = new ObjectID().toHexString();
var barId = new ObjectID().toHexString();
var fooToken = jwt.sign({ _id: fooId, access: "auth" }, "foobar");
var barToken = jwt.sign({ _id: barId, access: "auth" }, "foobar");

const users = [{
    _id: fooId,
    email: "foo@foo.com",
    password: "foopwd",
    tokens: {
      access: "auth",
      token: fooToken
    }
  },
  {
    _id: barId,
    email: "bar@bar.com",
    password: "barpwd"
  }
];

const populateTodos = () => {
  return Todo.deleteMany({})
    .then(
      () => {
        return Todo.insertMany(todos);
      })
    .catch(err => { return Promise.reject });
};


const populateUsers = () => {
  return User.deleteMany({})
    .then(
      () => {
        return User.insertMany(users);
      })
    .catch(err => { return Promise.reject });
};

// const populateUsers = () => {
//   return User.deleteMany({})
//     .then(
//       () => {
//         return new User(users[0]).save();
//       })
//     .catch(err => { return Promise.reject });
// };


module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
}
