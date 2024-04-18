const express = require("express");      
const router = express.Router();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const collection = require("../model/dbconnect");
const { v4: uuidv4 } = require("uuid");
const nocache = require("nocache");
router.use(nocache());
router.use(cookieParser());
router.use(
  session({ 
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);


const {adminLogin} = require('../controllers/adminController');

//Email validation
function isEmailValid(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

//Authenctication
async function Authentication (req, res, next) {
  if (req.session.username) {
    const users = await collection.find();
    res.render("adminconsole", { admin: req.session.username, users});
  } else {
    next();
  }
}

// login route
router.get("/login", Authentication,(req, res) => {
  
    res.render("adminlogin");
  // }
});

//login post route
router.post("/login", adminLogin)


//  edit route
router.get("/edit/:id", async (req, res) => {
  let id = req.params.id;
  let user_details = { _id: id };
  const item = await collection.findOne(user_details);
  res.render("edit", { item });
});

//update Route
router.post("/edit/:id", async (req, res) => {
  let id = req.params.id;
  let user_details = { _id: id };
  const user_id = req.body._id;
  const UserName = req.body.username;
  const Email = req.body.email;

  let update = { $set: { _id: user_id, username: UserName, email: Email } };
  await collection.updateOne(user_details, update);
  const users = await collection.find();

  const admindata = {
    username: "admin",
    password: "admin123",
  };
  res.render("adminconsole", { admin: admindata.username, users });
});

// Add user
router.get("/signup", (req, res) => {
  res.render("signup");
});


//block route
router.get("/block/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await collection.findOne({ _id: userId });

    if (!user) {
     
      console.log("Block User is not Found");
    }

    // Set the "isBlocked" property to true
    user.isBlocked = true;

    // Save the updated user document
    await user.save();

   
    const users = await collection.find();
    console.log(users);
    return res.render("adminconsole", { users });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error blocking user" });
  }
});

// search route
router.get('/search', async (req, res) => {
  const searchQuery = req.query.search
  const regexPattern = new RegExp(`^${searchQuery}`, 'i'); 

  const filteredUser = await collection.find({username: { $regex: regexPattern }})
  res.json(filteredUser)

})

// Delete Route
router.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleteUser = { _id: id };
    const result = await collection.deleteOne(deleteUser);

    if (result.deletedCount === 1) {
      console.log("Document deleted successfully.");
      const users = await collection.find();
      res.render("adminconsole", { users });
    }
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).send("An error occurred while deleting the document.");
  }
});

// Add a route to handle the redirection after deletion
router.get("/delete-success", (req, res) => {
  res.redirect("/admin/adminconsole");
});


// logout route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("error found while destroying  session", err);
    } else {
      res.render("adminlogin");
    }
  });
});

module.exports = router;
