const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// middleware
const {
  newPostHeadingCheck,
  newPostTextCheck,
  newPostDateCheck,
  checkAuth,
} = require("../middleware");

const SafeRun = require("../SafeRun");

// create new post
router.post(
  "/new",
  checkAuth,
  newPostHeadingCheck,
  newPostTextCheck,
  newPostDateCheck,
  (req, res) => {
    SafeRun(req, res, NewPost);
  }
);

router.get("/", checkAuth, (req, res) => {
  res.send("Posts plug");
});

// edit post
router.put("/edit/:id", checkAuth, (req, res) => {
  SafeRun(req, res, EditPost);
});

// delete post
router.delete("/delete/:id", checkAuth, (req, res) => {
  SafeRun(req, res, DeletePost);
});

router.get("/:id/comments", checkAuth, (req, res) => {
  SafeRun(req, res, GetPostComments);
});

// get certain post
router.get("/:id", checkAuth, (req, res) => {
  SafeRun(req, res, GetPost);
});

async function NewPost(req, res) {
  const userID = await req.user.then((user) => user._id);

  let post = new Post({
    authorId: userID.toString(),
    heading: req.body.heading,
    text: req.body.text,
    date: Date(),
  });

  post = await post.save();
  await User.findByIdAndUpdate(userID, { $push: { postsIds: post.id } });

  res.redirect(`/post/${post.id}`);
}

async function EditPost(req, res) {
  const userID = await req.user.then((user) => user._id);
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ error: "Post cannot be found." });

  if (post.authorId != userID)
    return res
      .status(400)
      .json({ error: "You are not an author of the post." });

  await Post.findByIdAndUpdate(post.id, {
    $set: {
      text: req.body.text ?? post.text,
      heading: req.body.heading ?? post.heading,
      date: Date(),
    },
  });

  res.redirect(`/post/${post.id}`);
}

async function DeletePost(req, res) {
  const userID = await req.user.then((user) => user._id);
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ error: "Post cannot be found." });

  if (post.authorId != userID)
    return res
      .status(400)
      .json({ error: "You are not an author of the post." });

  await Post.findByIdAndDelete(post.id);

  res.redirect("/post/");
}

async function GetPostComments(req, res) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(400).json({ error: "Post cannot be found." });
    const comments = await Comment.find({ postId: req.params.id });

    res.send(comments);
  } else {
    res.redirect("/");
  }
}

async function GetPost(req, res) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post cannot be found." });
    res.json(post);
  } else res.redirect("/");
}

module.exports = router;
