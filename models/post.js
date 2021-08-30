const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  heading: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model("Post", postSchema);
