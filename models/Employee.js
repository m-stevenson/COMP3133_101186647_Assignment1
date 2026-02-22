import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  gender: {
    type: String,
    enum: {
      values: ["Male", "Female", "Other"],
      message: "Gender must be male, female or other",
    },
  },
  designation: { type: String, required: true },
  salary: {
    type: Number,
    required: true,
    min: [1000, "Salary must be at least 1000"],
  },
  date_of_joining: { type: Date, required: true },
  department: { type: String, required: true },
  employee_photo: { type: String, default: null },
  timestamps: {
    created_at: "created_at",
    updated_at: "updated_at",
  },
});
