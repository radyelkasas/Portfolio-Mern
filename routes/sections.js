const express = require("express");
const router = express.Router();
const Section = require("../models/Section");

// جلب جميع الأقسام للمستخدم الحالي
router.get("/", async (req, res) => {
  try {
    const sections = await Section.find({ userId: req.userId }).sort("order");
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// إضافة قسم جديد
router.post("/", async (req, res) => {
  try {
    console.log("User ID:", req.userId); // للتحقق من وجود معرف المستخدم
    console.log("Request Body:", req.body); // للتحقق من البيانات المرسلة

    const section = new Section({
      ...req.body,
      userId: req.userId,
    });

    console.log("Section before save:", section); // للتحقق من البيانات قبل الحفظ

    const savedSection = await section.save();
    console.log("Saved section:", savedSection); // للتحقق من البيانات بعد الحفظ

    res
      .status(201)
      .json({ message: "تم إضافة القسم بنجاح", section: savedSection });
  } catch (error) {
    console.error("Error saving section:", error); // للتحقق من الخطأ إن وجد
    res.status(400).json({ message: error.message });
  }
});

// تعديل قسم
router.put("/:id", async (req, res) => {
  try {
    console.log("Update Request:", {
      id: req.params.id,
      userId: req.userId,
      body: req.body,
    });

    // استخدام findOneAndUpdate بدلاً من findOne
    const updatedSection = await Section.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        ...req.body,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true } // إرجاع الوثيقة المحدثة وتشغيل المصادقة
    );

    if (!updatedSection) {
      console.log("Section not found");
      return res.status(404).json({ message: "القسم غير موجود" });
    }

    console.log("Updated section:", updatedSection);
    res.json({
      message: "تم تعديل القسم بنجاح",
      section: updatedSection,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ message: error.message });
  }
});

// حذف قسم
router.delete("/:id", async (req, res) => {
  try {
    const section = await Section.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // التأكد من أن القسم يخص المستخدم
    });

    if (!section) {
      return res.status(404).json({ message: "القسم غير موجود" });
    }

    res.json({ message: "تم حذف القسم بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// جلب قسم محدد
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetch Section Request:", {
      id: req.params.id,
      userId: req.userId,
    });

    const section = await Section.findOne({
      _id: req.params.id,
      userId: req.userId, // التأكد من أن القسم يخص المستخدم
    });

    if (!section) {
      console.log("Section not found");
      return res.status(404).json({ message: "القسم غير موجود" });
    }

    console.log("Found section:", section);
    res.json(section);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
