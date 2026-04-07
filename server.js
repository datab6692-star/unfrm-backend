const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

////////////////////////////////////////////////////////////
/// 🔥 MIDDLEWARE
////////////////////////////////////////////////////////////
app.use(cors());
app.use(express.json());

////////////////////////////////////////////////////////////
/// 🔥 ROOT (FIX: Cannot GET /)
////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("🚀 UNFRM Backend Running");
});

////////////////////////////////////////////////////////////
/// 🔥 HEALTH CHECK (FOR RENDER)
////////////////////////////////////////////////////////////
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

////////////////////////////////////////////////////////////
/// 🔥 CONNECT MONGODB
////////////////////////////////////////////////////////////
mongoose.connect(
  "mongodb+srv://unfrm:unfrm123@cluster0.9ftvups.mongodb.net/unfrm?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("Mongo Error:", err));

////////////////////////////////////////////////////////////
/// 🔥 MODELS
////////////////////////////////////////////////////////////

const User = mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
}));

const Wishlist = mongoose.model("Wishlist", new mongoose.Schema({
  email: String,
  product: Object,
}));

const Behavior = mongoose.model("Behavior", new mongoose.Schema({
  email: String,
  productId: String,
  action: String,
  time: { type: Date, default: Date.now },
}));

////////////////////////////////////////////////////////////
/// 🔥 PRODUCTS (VIDEO READY)
////////////////////////////////////////////////////////////

const products = [
  {
    id: "p1",
    name: "UNFRM Street Tee",
    price: 799,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    ],
    video:
      "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    description: "Clean streetwear tee with premium cotton fit",
    link: "https://zara.com",
  },
  {
    id: "p2",
    name: "Oversized Black Tee",
    price: 999,
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    ],
    video: "",
    description: "Oversized relaxed fit for GenZ street style",
    link: "https://hm.com",
  },
  {
    id: "p3",
    name: "Minimal White Tee",
    price: 699,
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
    ],
    video:
      "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    description: "Minimal everyday wear with soft fabric",
    link: "https://nike.com",
  },
];

////////////////////////////////////////////////////////////
/// 🔐 SIGNUP
////////////////////////////////////////////////////////////
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashed });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// 🔐 LOGIN
////////////////////////////////////////////////////////////
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false });

    const ok = await bcrypt.compare(password, user.password);

    res.json({ success: ok });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// ❤️ TOGGLE WISHLIST
////////////////////////////////////////////////////////////
app.post("/wishlist", async (req, res) => {
  try {
    const { email, product } = req.body;

    const exists = await Wishlist.findOne({
      email,
      "product.name": product.name,
    });

    if (exists) {
      await Wishlist.deleteOne({ _id: exists._id });
      return res.json({ success: true, action: "removed" });
    }

    await Wishlist.create({ email, product });

    res.json({ success: true, action: "added" });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// ❤️ GET WISHLIST
////////////////////////////////////////////////////////////
app.get("/wishlist", async (req, res) => {
  try {
    const { email } = req.query;

    const items = await Wishlist.find({ email });

    res.json({
      wishlist: items.map(i => i.product),
    });
  } catch (e) {
    res.status(500).json({ wishlist: [] });
  }
});

////////////////////////////////////////////////////////////
/// 📊 TRACK USER BEHAVIOR
////////////////////////////////////////////////////////////
app.post("/track", async (req, res) => {
  try {
    const { email, productId, action } = req.body;

    await Behavior.create({ email, productId, action });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// 🔥 GET PRODUCTS
////////////////////////////////////////////////////////////
app.get("/products", (req, res) => {
  res.json({ products });
});

////////////////////////////////////////////////////////////
/// 🚀 START SERVER (RENDER READY)
////////////////////////////////////////////////////////////
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server Running on port ${PORT}`);
});