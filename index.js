if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const { urlencoded } = require("express");
const mongoose = require("mongoose");

const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const commentsRouter = require("./routes/comments");

const passport = require("passport");
const initializePassport = require("./passport-config");
initializePassport(passport);
const flash = require("express-flash");
const session = require("express-session");

const port = process.env.PORT || 5000;

// connect to DB
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(port, () => {
  console.log(`Port: ${port}`);
});

app.use(urlencoded({ extended: false }));
// setting up passportjs
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// using multiple routers
app.use("/post", postRouter);
app.use("/user", userRouter);
app.use("/comments", commentsRouter);

app.get("/", (req, res) => {
  // just a plug
  res.send("Just a plug");
});
