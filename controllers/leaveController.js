const Leave = require("../models/Leave")
const Employee = require("../models/Employee")

exports.getLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.session.user.id })
    if (!employee) {
      return res.status(404).send("Employee profile not found")
    }

    const leaves = await Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 })

    res.render("leave/index", { leaves, employee })
  } catch (error) {
    console.error("Leave error:", error)
    res.status(500).send("Error loading leaves")
  }
}

exports.getApplyLeave = (req, res) => {
  res.render("leave/apply", { error: null })
}

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body
    const employee = await Employee.findOne({ userId: req.session.user.id })

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) {
      return res.render("leave/apply", { error: "End date must be after start date" })
    }

    // Create leave request
    await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: "pending",
    })

    res.redirect("/leave")
  } catch (error) {
    console.error("Apply leave error:", error)
    res.render("leave/apply", { error: "Failed to apply for leave" })
  }
}

// Admin functions
exports.getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}

    const leaves = await Leave.find(filter)
      .populate({
        path: "employeeId",
        populate: { path: "userId" },
      })
      .populate("reviewedBy")
      .sort({ createdAt: -1 })

    const pendingCount = await Leave.countDocuments({ status: "pending" })

    res.render("leave/admin", {
      leaves,
      filterStatus: status || "all",
      pendingCount,
    })
  } catch (error) {
    console.error("Admin leave error:", error)
    res.status(500).send("Error loading leaves")
  }
}

exports.reviewLeave = async (req, res) => {
  try {
    const { status, comment } = req.body
    const leave = await Leave.findById(req.params.id)

    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" })
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ error: "Leave request already reviewed" })
    }

    leave.status = status
    leave.reviewComment = comment
    leave.reviewedBy = req.session.user.id
    leave.reviewDate = new Date()

    await leave.save()
    res.json({ success: true, leave })
  } catch (error) {
    console.error("Review leave error:", error)
    res.status(500).json({ error: "Error reviewing leave" })
  }
}
