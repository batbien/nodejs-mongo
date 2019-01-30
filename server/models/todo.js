const {mongoose} = require('../db/mongoose');

var Todo = mongoose.model('todos', {
  text: {
    type: String,
    trim: true,
    minLength: 1,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {
  Todo
};
