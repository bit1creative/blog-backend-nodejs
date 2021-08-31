const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/post");

// using for validation
const { body } = require("express-validator");

// using for decryption
const bcrypt = require("bcrypt");
// auth
const passport = require("passport");

// middleware
const {
  emailFilter,
  emailCheck,
  usernameCheck,
  sexCheck,
  passwordCheck,
  usersFriendIdCheck,
  checkAuth,
  checkNotAuth,
} = require("../middleware");

const SafeRun = require("../SafeRun");

router.get("/", (req, res) => {
  res.send("User plug.");
});

// just a plug (in dev redirection to register page)
router.get("/register", checkNotAuth, (req, res) => {
  res.send("Register page");
});

// register a new user using bcrypt for password
router.post(
  "/register",

  checkNotAuth,
  emailFilter,
  emailCheck,
  usernameCheck,
  sexCheck,
  passwordCheck,
  body("picUrl").isURL(),

  (req, res) => {
    SafeRun(req, res, Register);
  }
);

// just a plug (in dev redirection to login page)
router.get("/login", checkNotAuth, (req, res) => {
  // error display in dev
  // res.render("Login page.", { messages: req.flash("error") });
  // im using a plug
  res.send("Login page.");
});

// logging
router.post(
  "/login",

  checkNotAuth,
  emailFilter,

  passport.authenticate("local", {
    successRedirect: `/user/`,
    // if failure => error goes to req.flash
    failureRedirect: "/user/login",
    failureFlash: true,
  })
);

router.delete("/logout", checkAuth, (req, res) => {
  req.logOut();
  res.redirect("/user/login");
});

router.post("/add-friend", checkAuth, usersFriendIdCheck, (req, res) => {
  SafeRun(req, res, AddFriend);
});

router.post("/remove-friend", checkAuth, usersFriendIdCheck, (req, res) => {
  SafeRun(req, res, RemoveFriend);
});

// get list of user's friends IDs
router.get("/friends", checkAuth, (req, res) => {
  SafeRun(req, res, GetUsersFriendsIds);
});

// get user's all posts
router.get("/:id/posts", checkAuth, (req, res) => {
  SafeRun(req, res, GetUsersPosts);
});

// get user from DB by id
router.get("/:id", checkAuth, async (req, res) => {
  SafeRun(req, res, GetUserById);
});

async function Register(req, res) {
  // decrypting the password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  let newUser = new User({
    username: req.body.username,
    picUrl: req.body.picUrl,
    sex: req.body.sex,
    postsIds: [],
    friendsIds: [],
    email: req.body.email,
    password: hashedPassword,
  });

  // saving to database
  newUser = await newUser.save();

  res.redirect(`/user/login`);
}

async function AddFriend(req, res) {
  // req.user - that's a passportJS feature
  const userID = await req.user.then((user) => user._id);
  const friendID = req.body.friendId;
  // not ===, because userID - object
  if (userID == friendID)
    return res.status(400).json({ error: "Cannot add yourself." });

  const alreadyFriends = await User.findById(userID).then((user) =>
    user.friendsIds.includes(friendID)
  );
  if (alreadyFriends)
    return res.status(400).json({ error: "Already friends." });

  await User.findByIdAndUpdate(userID, { $push: { friendsIds: friendID } });
  await User.findByIdAndUpdate(friendID, { $push: { friendsIds: userID } });
  res.status(200).send();
}

async function RemoveFriend(req, res) {
  const userID = await req.user.then((user) => user._id);
  const friendID = req.body.friendId;
  if (userID == friendID)
    return res.status(400).json({ error: "Cannot remove yourself." });

  const areFriends = await User.findById(userID).then((user) =>
    user.friendsIds.includes(friendID)
  );

  if (!areFriends) return res.status(400).json({ error: "Not friends." });

  await User.findByIdAndUpdate(userID, { $pull: { friendsIds: friendID } });
  await User.findByIdAndUpdate(friendID, { $pull: { friendsIds: userID } });
  res.status(200).send();
}

async function GetUsersFriendsIds(req, res) {
  const userID = await req.user.then((user) => user._id);
  const friendsIdsArray = await User.findById(userID).then(
    (user) => user.friendsIds
  );
  res.send(friendsIdsArray);
}

async function GetUsersPosts(req, res) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    const user = await User.findById(req.params.id, {
      email: false,
      password: false,
    });

    if (!user) return res.status(404).json({ error: "User cannot be found." });
    const postsIds = user.postsIds;

    const posts = await Post.find({ _id: { $in: postsIds } });
    res.send(posts);
  } else {
    res.redirect("/");
  }
}

async function GetUserById(req, res) {
  // check for id
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    // get user by id without email and password
    const user = await User.findById(req.params.id, {
      email: false,
      password: false,
    });
    if (!user) return res.status(404).json({ error: "User cannot be found." });
    res.send(user);
  } else {
    res.redirect("/");
  }
}

module.exports = router;
