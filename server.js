const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

/// 🔥 CONNECT MONGODB ATLAS
mongoose.connect(
  "mongodb+srv://unfrm:unfrm123@cluster0.9ftvups.mongodb.net/unfrm?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("Mongo Error:", err));

/// 🔥 USER MODEL
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

/// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("UNFRM Backend Running 🚀");
});

/// 🔥 SIGNUP (WITH BCRYPT)
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  console.log("Signup request:", email);

  try {
    if (!email || !password) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const cleanEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: cleanEmail });

    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    /// 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: cleanEmail,
      password: hashedPassword,
    });

    console.log("User created:", newUser);

    res.json({ success: true, message: "Signup successful" });

  } catch (error) {
    console.log("SIGNUP ERROR:", error);

    if (error.code === 11000) {
      return res.json({ success: false, message: "User already exists" });
    }

    res.json({ success: false, message: error.message });
  }
});

/// 🔥 LOGIN (WITH BCRYPT)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login request:", email);

  try {
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    /// 🔐 COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({ success: true, message: "Login success" });
    } else {
      res.json({ success: false, message: "Wrong password" });
    }

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.json({ success: false, message: "Login failed" });
  }
});

/// 🔥 START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} 🚀`);
});