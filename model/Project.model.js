const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    primaryKey: true
  }
});

module.exports = mongoose.model("project", projectSchema);
