const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    primaryKey: true
  },
  name: {
    type: String,
    required: true,
  },
  timezone: {
    type: Number,
    required: false
  },
  schedule: {
    type: String,
    required: false
  },
  admin: {
    type: Boolean,
  },
  categories: {
    type: Array,
    default: []
  },
  going: {
    type: Boolean,
    default: false,
  },
  weekdays: {
    type: Array,
    default: [1, 2, 3, 4, 5, 6, 7],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
