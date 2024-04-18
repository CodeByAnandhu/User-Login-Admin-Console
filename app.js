const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();

// convert data to json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const port = 5000;

const userRouter = require("./routers/user");
const adminRouter = require("./routers/admin");

app.use("/", userRouter);
app.use("/admin", adminRouter);

app.listen(port, () =>
  console.log("server is running on http://localhost:5000")
);
