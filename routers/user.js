const express = require("express");
const router = express.Router();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const nocache = require("nocache");
const { v4: uuidv4 } = require("uuid");
const collection = require("../model/dbconnect");

router.use(nocache());
router.use(cookieParser());
router.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

//Email validation
function isEmailValid(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

//Authentication
function Authentication(req, res, next) {
  if (req.session.userId) {
    //Redirect to homepage if authenticated
    res.render("home", { user: req.session.username });
  } else {
    next();
  }
}

//  login router
router.get("/", Authentication, (req, res) => {
  res.render("login");
});

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  
  if (password === null || password.trim() === "") {
    console.log("Password must be filled.");
    return res.render("login", { message: " password must be filled." });
  }
  if (!isEmailValid(email)) {
    res.render("login", { message: "Email  is not valid " });
  } else {
    try { 
      // checking  email exist or not
      const check = await collection.findOne({ email: email });
      if (!check) {
        res.render("login", { message: "Email not valid!!" });
      }

      if (check.isBlocked) {
        // Check if the user is blocked
        res.render("login", { message: "Your account is blocked" });
      } else {
        if (req.body.password === check.password) {
          req.session.userId = check._id;
          req.session.username = check.username;

          res.render("home", { user: check.username });
        } else {
          res.render("login", { message: "login failed" });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
});

// signup router
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  if (data.username === null || data.username.trim() === "") {
    console.log("Username must be filled.");
    return res.render("signup", { message: "The username must be filled." });
  }
  if (!isEmailValid(data.email)) {
    res.render("signup", { message: "Email is not valid" });
  } else {
    try {
      // checking duplicate email ,finding alredy exist or not 
      const userExists = await collection.findOne({ email: data.email });
      if (!userExists) {

        await collection.insertMany(data);

        console.log("User registered successfully!!");
        res.render("login", {
          loginmessage: "Signup successful, please login",
        });
      } else {
        res.render("signup", { message: "Email already exists!!" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).send("Internal Server Error");
    }
  }
});

//Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("error found while destroying  session: ", err);
    } else {
      res.render("login");
    }
  });
});

module.exports = router;
