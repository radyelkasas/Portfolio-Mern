const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config");
const authMiddleware = require("../middleware/auth");
const Section = require("../models/Section");

// تسجيل مستخدم جديد
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "اسم المستخدم موجود مسبقاً" });
      }
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
      }
    }

    // التحقق من كلمة المرور
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" });
    }

    // إنشاء مستخدم جديد
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // إنشاء توكن JWT
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "بيانات غير صالحة" });
    }
    res.status(500).json({ message: error.message });
  }
});

// تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // البحث عن المستخدم باسم المستخدم أو البريد الإلكتروني
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    // التحقق من كلمة المرور
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    // إنشاء توكن JWT
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// التحقق من صحة التوكن
router.get("/verify", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// تحديث معلومات المستخدم
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // التحقق من تكرار اسم المستخدم
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "اسم المستخدم موجود مسبقاً" });
      }
      user.username = username;
    }

    // التحقق من تكرار البريد الإلكتروني
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res
          .status(400)
          .json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
      }
      user.email = email;
    }

    // تحديث كلمة المرور إذا تم توفيرها
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "كلمة المرور الحالية غير صحيحة" });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      message: "تم تحديث المعلومات بنجاح",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// جلب إحصائيات المستخدم
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const sectionsCount = await Section.countDocuments({ userId: req.userId });
    const user = await User.findById(req.userId);

    res.json({
      sectionsCount,
      joinDate: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
