const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const sectionsRouter = require("./routes/sections");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const { JWT_SECRET } = require("./config");
const path = require("path");

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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

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

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
