const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

/// 🔥 CONNECT MONGODB (FIXED)
mongoose.connect("mongodb://127.0.0.1:27017/unfrm")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

/// 🔥 USER MODEL
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

/// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("UNFRM Backend Running 🚀");
});

/// 🔥 SIGNUP
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.json({ success: false, message: "User exists" });
    }

    await User.create({ email, password });

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, message: "Error creating user" });
  }
});

/// 🔥 LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (user) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }

  } catch (error) {
    res.json({ success: false });
  }
});

app.listen(5000, "0.0.0.0",() => {
  console.log("Server running on port 5000 🚀");
});