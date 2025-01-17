require('dotenv').config()
// console.log(process.env.MONGO_URL)
const express = require("express");
const mongoose = require("mongoose");

const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");
const app = express();
app.use(express.json());
  
//for front end part on
// app.use(express.static("public"));
// app.get("/signup", function(req, res){
//     //console.log("request came");
//     res.sendFile(__dirname + "/public/index.html");
// });
// app.get("/signin", function(req, res){
//     //console.log("request came");
//     res.sendFile(__dirname + "/public/index.html");
// });
  
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

async function main() {
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(3000);
    //console.log("listening on port 3000")
} 

main()