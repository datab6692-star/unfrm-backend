const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

////////////////////////////////////////////////////////////
/// 🔥 CONNECT MONGODB
////////////////////////////////////////////////////////////

mongoose.connect(
  "mongodb+srv://unfrm:unfrm123@cluster0.9ftvups.mongodb.net/unfrm?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("Mongo Error:", err));

////////////////////////////////////////////////////////////
/// 🔥 USER MODEL
////////////////////////////////////////////////////////////

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
});

const User = mongoose.model("User", UserSchema);

////////////////////////////////////////////////////////////
/// ❤️ WISHLIST MODEL
////////////////////////////////////////////////////////////

const WishlistSchema = new mongoose.Schema({
  email: String,
  product: Object,
});

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

////////////////////////////////////////////////////////////
/// 📊 USER BEHAVIOR
////////////////////////////////////////////////////////////

const BehaviorSchema = new mongoose.Schema({
  email: String,
  productId: String,
  action: String,
  time: { type: Date, default: Date.now },
});

const Behavior = mongoose.model("Behavior", BehaviorSchema);

////////////////////////////////////////////////////////////
/// 🔐 SIGNUP
////////////////////////////////////////////////////////////

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) return res.json({ success: false });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ email, password: hashed });

  res.json({ success: true });
});

////////////////////////////////////////////////////////////
/// 🔐 LOGIN
////////////////////////////////////////////////////////////

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.json({ success: false });

  const ok = await bcrypt.compare(password, user.password);

  res.json({ success: ok });
});

////////////////////////////////////////////////////////////
/// ❤️ TOGGLE WISHLIST
////////////////////////////////////////////////////////////

app.post("/wishlist", async (req, res) => {
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
});

////////////////////////////////////////////////////////////
/// ❤️ GET WISHLIST
////////////////////////////////////////////////////////////

app.get("/wishlist", async (req, res) => {
  const { email } = req.query;

  const items = await Wishlist.find({ email });

  res.json({
    wishlist: items.map(i => i.product),
  });
});

////////////////////////////////////////////////////////////
/// 📊 TRACK
////////////////////////////////////////////////////////////

app.post("/track", async (req, res) => {
  const { email, productId, action } = req.body;

  await Behavior.create({ email, productId, action });

  res.json({ success: true });
});

////////////////////////////////////////////////////////////
/// 🔥 PRODUCTS (FINAL STRUCTURE)
////////////////////////////////////////////////////////////

const products = [
  {
    id: "p1",
    name: "UNFRM Street Tee",
    price: 799,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"
    ],
    description: "Clean streetwear tee with premium cotton fit",
    link: "https://zara.com",
  },

  {
    id: "p2",
    name: "Oversized Black Tee",
    price: 999,
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7"
    ],
    description: "Oversized relaxed fit for GenZ street style",
    link: "https://hm.com",
  },

  {
    id: "p3",
    name: "Minimal White Tee",
    price: 699,
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990"
    ],
    description: "Minimal everyday wear with soft fabric",
    link: "https://nike.com",
  },
];

app.get("/products", (req, res) => {
  res.json({ products });
});

////////////////////////////////////////////////////////////
/// 🚀 START
////////////////////////////////////////////////////////////

app.listen(5000, "0.0.0.0", () => {
  console.log("Server Running 🚀");
});