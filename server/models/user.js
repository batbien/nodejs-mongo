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
  tokens: [{
    access: {
      type: String,
      require: true
    },
    token: {
      type: String,
      require: true
    }
  }]
});

UserSchema.methods.generateAuthToken = function() {
  var token = jwt.sign({ _id: this._id, access: "auth" }, "foobar");
  this.tokens.push({ access: "auth", token });
  return this.save().then(
    () => { return Promise.resolve(token); }
  );
};

UserSchema.methods.toJSON = function() {
  return _.pick(this, ["_id", "email"]);
};

UserSchema.statics.findByToken = (token) => {
  try {
    var decoded = jwt.verify(token, "foobar");
    return User.findOne({
      "_id": decoded._id
    }).then(
      user => {
        return user.tokens.filter(
            t => { return t.access == decoded.access && t.token == token })
          .length == 1 ? Promise.resolve(user) : Promise.reject();
      }
    )
  } catch (err) {
    return Promise.reject(err.message);
  };
};

UserSchema.statics.findByCredential = function(credential) {
  var user;
  return User.findOne({ email: credential.email }).exec()
    .then(
      user => {
        if (!user)
          return Promise.reject("Wrong email");
        this.user = user;
        return bcrypt.compare(credential.password, user.password)
      })
    .then(res => {
      if (!res)
        return Promise.reject("Wrong password");
      return Promise.resolve(this.user);
    })
    .catch(err => { return Promise.reject(err.message); })
};

UserSchema.pre("save", function(next) {
  if (!this.isModified("password"))
    return next();
  bcrypt.genSalt(10, (err, salt) => {
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

// This must be called after user has been authenticated
UserSchema.methods.removeToken = function(token) {
  return this.updateOne({
    $pull: {
      tokens: { token }
    }
  }).exec();
};

var User = mongoose.model('users', UserSchema);


module.exports = {
  User
};
