// Required dependencies
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/pageManager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Section Schema
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    default: "#ffffff",
  },
  imageUrl: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Section = mongoose.model("Section", sectionSchema);

// Routes

// 1. إضافة قسم جديد
router.post("/sections", async (req, res) => {
  try {
    const section = new Section({
      title: req.body.title,
      content: req.body.content,
      backgroundColor: req.body.backgroundColor,
      imageUrl: req.body.imageUrl,
      order: req.body.order,
    });

    const savedSection = await section.save();
    res.status(201).json(savedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. جلب جميع الأقسام
router.get("/sections", async (req, res) => {
  try {
    const sections = await Section.find().sort("order");
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. جلب قسم محدد
router.get("/sections/:id", async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (section) {
      res.json(section);
    } else {
      res.status(404).json({ message: "القسم غير موجود" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. تعديل قسم
router.put("/sections/:id", async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (section) {
      section.title = req.body.title || section.title;
      section.content = req.body.content || section.content;
      section.backgroundColor =
        req.body.backgroundColor || section.backgroundColor;
      section.imageUrl = req.body.imageUrl || section.imageUrl;
      section.order = req.body.order || section.order;
      section.updatedAt = Date.now();

      const updatedSection = await section.save();
      res.json(updatedSection);
    } else {
      res.status(404).json({ message: "القسم غير موجود" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. حذف قسم
router.delete("/sections/:id", async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (section) {
      await section.remove();
      res.json({ message: "تم حذف القسم بنجاح" });
    } else {
      res.status(404).json({ message: "القسم غير موجود" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
