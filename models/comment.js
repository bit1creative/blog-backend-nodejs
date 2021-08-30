const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  postId: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model("Comment", commentSchema);
