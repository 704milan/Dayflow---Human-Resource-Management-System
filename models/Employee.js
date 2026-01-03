const mongoose = require("mongoose")

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  personalDetails: {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: String,
    address: String,
    dateOfBirth: Date,
    profilePicture: String,
  },
  jobDetails: {
    position: String,
    department: String,
    joinDate: { type: Date, default: Date.now },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract"],
      default: "full-time",
    },
  },
  salaryDetails: {
    baseSalary: Number,
    allowances: Number,
    deductions: Number,
    currency: { type: String, default: "USD" },
  },
  documents: [
    {
      name: String,
      url: String,
      uploadDate: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Employee", employeeSchema)
