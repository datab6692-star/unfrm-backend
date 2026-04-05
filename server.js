
/// 🔥 CONNECT MONGODB (TEMP - LOCAL ONLY)
//mongoose.connect("mongodb://127.0.0.1:27017/unfrm")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

/// 🔥 PORT FIX (IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running 🚀 on port " + PORT);
});