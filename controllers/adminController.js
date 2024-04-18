const collection = require("../model/dbconnect");
exports.adminLogin =( async (req, res) => { 
    const { username, password } = req.body;
  
    const admindata = {
      username: "admin",
      password: "admin123",
    };




    function isEmailValid(email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    }



    if (username === null || username.trim() === "") {
      console.log("Username must be filled.");
      return res.render("adminlogin", { message: "The username must be filled." });
    }
    if (username === admindata.username && password === admindata.password) {
      req.session.userId = 123;
      req.session.username = admindata.username;
  
      const users = await collection.find();
      console.log(users);
  
      res.render("adminconsole", { admin: admindata.username, users });
    } else {
      res.render("adminlogin", { message: "login failed!" });
    }
  });