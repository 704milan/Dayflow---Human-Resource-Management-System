const mongoose = require("mongoose")

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["paid", "sick"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewComment: String,
  reviewDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

leaveSchema.index({ employeeId: 1, status: 1 })

module.exports = mongoose.model("Leave", leaveSchema)
