// models/Section.js
const mongoose = require("mongoose");

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
  // إضافة حقل المستخدم
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
module.exports = Section;