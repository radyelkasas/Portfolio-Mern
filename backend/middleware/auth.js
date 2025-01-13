const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Received token:", token);

    if (!token) {
      return res.status(401).json({ message: "الرجاء تسجيل الدخول" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "جلسة غير صالحة" });
  }
};

module.exports = authMiddleware;
