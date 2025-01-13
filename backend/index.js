const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const sectionsRouter = require("./routes/sections");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const { JWT_SECRET } = require("./config");

const app = express();

// MongoDB Atlas Connection
const MONGODB_URI =
  "mongodb+srv://radyrado00:rady12345@cluster0.ok7ka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sections", authMiddleware, sectionsRouter);

// Updated MongoDB Connection without deprecated options
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Successfully connected to MongoDB."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Routes
app.use("/api", sectionsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "حدث خطأ في الخادم" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
