const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", 
      required: false,
    },
    dueDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Todo", todoSchema);
