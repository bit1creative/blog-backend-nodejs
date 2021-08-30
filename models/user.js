const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  picUrl: { type: String, required: true },
  sex: { type: String, required: true },
  postsIds: { type: [String], required: true },
  friendsIds: { type: [String], required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
