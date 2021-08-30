const User = require("../models/user");
// using for validation
const { body } = require("express-validator");

// some of these middlewares are const because im using express-validator
//
//
//
//

const emailFilter = body("email")
  .isLength({ min: 5 })
  .isEmail()
  .normalizeEmail();

// check for email and if user with that email is already registered
const emailCheck = body("email").custom((email) => {
  return User.findOne({ email }).then((user) => {
    if (user) return Promise.reject("Email already in use");
  });
});

// check for username not to be taken
const usernameCheck = body("username")
  .isLength({ min: 3 })
  .custom((username) => {
    return User.findOne({ username }).then((user) => {
      if (user) return Promise.reject("Username already in use.");
    });
  });

// check if user exist by id
const usersFriendIdCheck = body("friendId")
  .isLength({ min: 20 })
  .custom((id) => {
    return User.findById(id).then((user) => {
      if (!user) {
        return Promise.reject("No user found.");
      }
    });
  });

// check new post requirements
const newPostHeadingCheck = body("heading").isLength({ min: 3 });
const newPostTextCheck = body("text").isLength({ min: 20 });
const newPostDateCheck = body("date").isDate();

//
const newCommentPostIdCheck = body("text").isLength({ min: 20 });
const newCommentTextCheck = body("text").isLength({ min: 1 });

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/user/login");
}

// check for user not to be authenticated
function checkNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/user/");
  }
  next();
}

module.exports = {
  emailFilter,
  emailCheck,
  usernameCheck,
  usersFriendIdCheck,
  newPostHeadingCheck,
  newPostTextCheck,
  newPostDateCheck,
  newCommentPostIdCheck,
  newCommentTextCheck,
  checkAuth,
  checkNotAuth,
};
