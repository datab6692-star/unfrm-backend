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
/// 🔥 ROOT
////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("🚀 UNFRM Backend Running");
});

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

/// 🔥 UPDATED PRODUCT MODEL (SOCIAL READY)
const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  price: Number,
  images: [String],
  video: String,
  description: String,
  link: String,

  /// ✅ NEW
  user: String,
  type: String, // "video" or "image"

  createdAt: { type: Date, default: Date.now },
}));

////////////////////////////////////////////////////////////
/// 🔐 SIGNUP
////////////////////////////////////////////////////////////
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.json({ success: false });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed });

    res.json({ success: true });
  } catch {
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
  } catch {
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// ❤️ WISHLIST
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

  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/wishlist", async (req, res) => {
  try {
    const { email } = req.query;

    const items = await Wishlist.find({ email });

    res.json({
      wishlist: items.map(i => i.product),
    });
  } catch {
    res.status(500).json({ wishlist: [] });
  }
});

////////////////////////////////////////////////////////////
/// 📊 TRACK
////////////////////////////////////////////////////////////
app.post("/track", async (req, res) => {
  try {
    const { email, productId, action } = req.body;

    await Behavior.create({ email, productId, action });

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// 🔥 USER UPLOAD (MAIN FEATURE 🔥)
////////////////////////////////////////////////////////////
app.post("/upload-post", async (req, res) => {
  try {
    let { email, video, images, description } = req.body;

    /// fallback
    if (!images || images.length === 0) {
      images = [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
      ];
    }

    if (!video) video = "";

    const type = video && video !== "" ? "video" : "image";

    const post = await Product.create({
      name: "User Post",
      price: 0,
      images,
      video,
      description,
      link: "",
      user: email,
      type,
    });

    res.json({ success: true, post });

  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// 🔥 GET FEED (SOCIAL FEED)
////////////////////////////////////////////////////////////
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const clean = products.map(p => ({
      ...p._doc,
      images: p.images && p.images.length > 0
        ? p.images
        : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"],
      video: p.video || "",
    }));

    res.json({ products: clean });

  } catch {
    res.status(500).json({ products: [] });
  }
});

////////////////////////////////////////////////////////////
/// 🚀 START
////////////////////////////////////////////////////////////
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server Running on port ${PORT}`);
});