const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
require('dotenv').config()

app.use(express.json());

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/users", async (req, res) => {
  var {name, email, password} = req.body;
  password = await bcrypt.hash(password, 10)
  const createdUser = await User.create(
    {name, email, password}
  );
  return res.json({
    message: "user has been created",
    "id":createdUser.id
  });
});

  

app.get("/users/:id", async(req, res) => {

	const id = req.params.id
	
	const data = await User.findById(id)
	
	return res.json(data)

});
app.post("/login", async (req, res) => {
    const data = req.body
    const dbUser = await User.findOne({email: data.email})
    const isMatched = await bcrypt.compare(data.password, dbUser.password)
    if(!dbUser || !isMatched){
        return res.status(404).json({
            "message":"User not found or invalid  Credentials"
        })
    }
    const token = jwt.sign({userId: dbUser._id}, process.env.JWT_SECRET);
    return res.json({
        "message":"valid credentials",
        "token": token
    })

})
app.get("/validate", async(req, res) => {
    const token = req.query("token")
    const isValid = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    const dbUser = await User.findById(userId)
    return res.json({
        "message":"valid token",
        "id":dbUser._id,
        "name":dbUser.name,
        "email":dbUser.email
    })
})




app.listen(5000, () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("MongoDB is successfully connected");
    })
    .catch((err) => {
      console.log(err);
    });
  console.log("Server is running on port 5000");
});
