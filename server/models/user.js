const { mongoose } = require('../db/mongoose');
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

var UserQuery = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    minlength: 6,
    require: true
  },
  tokens: {
    access: {
      type: String,
      require: true
    },
    token: {
      type: String,
      require: true
    }
  }
});

UserQuery.methods.generateAuthToken = function() {
  var token = jwt.sign({ _id: this._id, access: "auth" }, "foobar");
  this.tokens = { access: "auth", token };
  return this.save().then(
    () => { return token; }
  );
};

UserQuery.methods.toJSON = function() {
  return _.pick(this, ["_id", "email"]);
};

UserQuery.statics.findByToken = (token) => {
  try {
    var decoded = jwt.verify(token, "foobar");
    return User.findOne({
      "_id": decoded._id,
      "tokens.token": token,
      "tokens.access": decoded.access
    });
  } catch (err) {
    return Promise.reject(err.message);
  };
};

var User = mongoose.model('users', UserQuery);


module.exports = {
  User
};
