const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

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

/// 🔥 SIGNUP
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  console.log("Signup request:", email, password);

  try {
    // ✅ Validation
    if (!email || !password) {
      return res.json({ success: false, message: "Missing fields" });
    }

    // ✅ Normalize email (IMPORTANT FIX)
    const cleanEmail = email.toLowerCase().trim();

    // ✅ Check existing
    const userExists = await User.findOne({ email: cleanEmail });

    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // ✅ Save user
    const newUser = await User.create({
      email: cleanEmail,
      password,
    });

    console.log("User created:", newUser);

    res.json({ success: true, message: "Signup successful" });

  } catch (error) {
    console.log("SIGNUP ERROR:", error);

    // 🔥 HANDLE DUPLICATE ERROR (IMPORTANT)
    if (error.code === 11000) {
      return res.json({ success: false, message: "User already exists" });
    }

    res.json({ success: false, message: error.message });
  }
});

/// 🔥 LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login request:", email);

  try {
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
      password,
    });

    if (user) {
      res.json({ success: true, message: "Login success" });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
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