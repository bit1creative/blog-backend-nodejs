const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/post");

// middleware
const {
  newCommentTextCheck,
  newCommentPostIdCheck,
  checkAuth,
} = require("../middleware");

const SafeRun = require("../SafeRun");

router.post(
  "/new",
  checkAuth,
  newCommentPostIdCheck,
  newCommentTextCheck,
  (req, res) => {
    SafeRun(req, res, NewComment);
  }
);

router.put("/edit/:id", checkAuth, newCommentTextCheck, (req, res) => {
  SafeRun(req, res, EditComment);
});

router.delete("/delete/:id", checkAuth, (req, res) => {
  SafeRun(req, res, DeleteComment);
});

// get all comments to certain post
router.get("/:id", checkAuth, (req, res) => {
  SafeRun(req, res, GetCommentById);
});

async function NewComment(req, res) {
  const userID = await req.user.then((user) => user._id);
  let comment = new Comment({
    authorId: userID.toString(),
    postId: req.body.postId,
    text: req.body.text,
    date: Date(),
  });

  comment = await comment.save();
  res.redirect(`/comments/${comment.id}`);
}

async function EditComment(req, res) {
  const userID = await req.user.then((user) => user._id);
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(400).json({ error: "Comment cannot be found." });

    if (comment.authorId != userID)
      return res
        .status(400)
        .json({ error: "You are not an author of this comment." });

    await Comment.findByIdAndUpdate(comment.id, {
      $set: { text: req.body.text },
    });

    res.redirect(`/comments/${comment.id}`);
  } else {
    res.redirect("/");
  }
}

async function DeleteComment(req, res) {
  const userID = await req.user.then((user) => user._id);
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(400).json({ error: "Comment cannot be found." });

    if (comment.authorId != userID)
      return res
        .status(400)
        .json({ error: "You are not an author of this comment." });

    await Comment.findByIdAndDelete(req.params.id);

    res.redirect(`/post/${comment.postId}/comments`);
  } else {
    res.redirect("/");
  }
}

async function GetCommentById(req, res) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(400).json({ error: "Comment cannot be found." });

    res.send(comment);
  } else {
    res.redirect("/");
  }
}

module.exports = router;
