const {mongoose} = require('../db/mongoose');

var User = mongoose.model('users', {
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true,
    minlength: 3
  }
});

module.exports={
  User
};
