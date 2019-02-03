const mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
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
  },
  _owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {
  Todo
};
