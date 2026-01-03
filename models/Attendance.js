const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkIn: Date,
  checkOut: Date,
  status: {
    type: String,
    enum: ["present", "absent", "on-leave", "half-day"],
    default: "absent",
  },
  remarks: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster queries
attendanceSchema.index({ employeeId: 1, date: 1 })

module.exports = mongoose.model("Attendance", attendanceSchema)
