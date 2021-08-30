const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/user");

// initialize passport.js
function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    const user = await findUserByEmail(email);
    if (user === null) {
      return done(null, false, { message: "Email or password is incorrect." });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: "Email or password is incorrect.",
        });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(
    new LocalStrategy(
      {
        // logging in via email + password
        usernameField: "email",
      },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, findUserById(id));
  });
}

// find user by email
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// find user by id
const findUserById = async (id) => {
  return await User.findOne({ _id: id });
};

module.exports = initialize;
