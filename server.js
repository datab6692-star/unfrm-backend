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

const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  price: Number,
  images: [String],
  video: String,
  description: String,
  link: String,
  user: String,
  type: String,
  createdAt: { type: Date, default: Date.now },
}));

////////////////////////////////////////////////////////////
/// 🔐 AUTH
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
      "product._id": product._id,
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

    const items = await Wishlist.find({ email }).lean();

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
/// 🔥 UPLOAD (USER)
////////////////////////////////////////////////////////////
app.post("/upload-post", async (req, res) => {
  try {
    let { email, video, images, description } = req.body;

    if (!video || video === "") {
      return res.json({ success: false, message: "Video required" });
    }

    if (!images || images.length === 0) {
      images = [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
      ];
    }

    const post = await Product.create({
      name: "User Post",
      price: 0,
      images,
      video,
      description,
      link: "",
      user: email,
      type: "video",
    });

    res.json({ success: true, post });

  } catch (e) {
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// 🔥 ADMIN UPLOAD
////////////////////////////////////////////////////////////
app.post("/admin/upload", async (req, res) => {
  try {
    const { video, name, price, link, thumbnail } = req.body;

    if (!video) {
      return res.json({ success: false, message: "Video required" });
    }

    const product = await Product.create({
      name: name || "Product",
      price: price || 0,
      images: [
        thumbnail ||
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
      ],
      video,
      description: "Uploaded by admin",
      link: link || "",
      user: "admin",
      type: "video",
    });

    res.json({ success: true, product });

  } catch {
    res.status(500).json({ success: false });
  }
});

////////////////////////////////////////////////////////////
/// 🔥 GET PRODUCTS (PRO FEED API)
////////////////////////////////////////////////////////////
app.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // 🔥 only 5 videos per request
    const skip = (page - 1) * limit;

    const products = await Product.find({
      video: { $ne: "", $exists: true } // 💀 only valid videos
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const clean = products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      video: p.video,
      link: p.link,
      description: p.description,
      images: p.images?.length
        ? p.images
        : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"],
    }));

    res.json({
      page,
      count: clean.length,
      products: clean,
    });

  } catch (e) {
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