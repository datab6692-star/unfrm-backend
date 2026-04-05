const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

/// 🔥 CONNECT MONGODB (FIXED)
mongoose.connect(
  "mongodb+srv://unfrm:unfrm123@cluster0.9ftvups.mongodb.net/unfrm?retryWrites=true&w=majority"
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

  try {
    if (!email || !password) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const cleanEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: cleanEmail });

    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email: cleanEmail,
      password: hashedPassword,
    });

    res.json({ success: true });

  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "User already exists" });
    }

    res.json({ success: false, message: error.message });
  }
});

/// 🔥 LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Wrong password" });
    }

  } catch (error) {
    res.json({ success: false, message: "Login failed" });
  }
});

/// 🔥 PRODUCTS DATA
const products = [
  {
    name: "UNFRM Street Tee",
    price: 799,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    link: "https://zara.com",
  },
  {
    name: "Oversized Black Tee",
    price: 999,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    link: "https://hm.com",
  },
  {
    name: "Minimal White Tee",
    price: 699,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
    link: "https://nike.com",
  },
];

/// 🔥 GET PRODUCTS API
app.get("/products", (req, res) => {
  res.json(products);
});

/// 🔥 START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} 🚀`);
});