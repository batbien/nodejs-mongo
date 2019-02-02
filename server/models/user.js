const { mongoose } = require('../db/mongoose');
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
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

UserSchema.methods.generateAuthToken = function() {
  var token = jwt.sign({ _id: this._id, access: "auth" }, "foobar");
  this.tokens = { access: "auth", token };
  return this.save().then(
    () => { return token; }
  );
};

UserSchema.methods.toJSON = function() {
  return _.pick(this, ["_id", "email"]);
};

UserSchema.statics.findByToken = (token) => {
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

UserSchema.pre("save", function(next) {
  if (!this.isModified("password"))
    return next();
  bcrypt.genSalt(1, (err, salt) => {
    if (err)
      return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err)
        return next(err);
      this.password = hash;
      next();
    });
  });
});

var User = mongoose.model('users', UserSchema);


module.exports = {
  User
};
