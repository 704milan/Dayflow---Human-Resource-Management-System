const Employee = require("../models/Employee")
const Attendance = require("../models/Attendance")
const Leave = require("../models/Leave")

exports.getDashboard = async (req, res) => {
  try {
    const user = req.session.user

    if (user.role === "admin" || user.role === "hr") {
      // Admin dashboard
      const totalEmployees = await Employee.countDocuments()
      const pendingLeaves = await Leave.countDocuments({ status: "pending" })
      const todayAttendance = await Attendance.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: "present",
      })

      res.render("dashboard/admin", {
        totalEmployees,
        pendingLeaves,
        todayAttendance,
      })
    } else {
      // Employee dashboard
      const employee = await Employee.findOne({ userId: user.id }).populate("userId")
      const recentAttendance = await Attendance.find({ employeeId: employee._id }).sort({ date: -1 }).limit(7)
      const pendingLeaves = await Leave.find({
        employeeId: employee._id,
        status: "pending",
      })

      res.render("dashboard/employee", {
        employee,
        recentAttendance,
        pendingLeaves,
      })
    }
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).send("Error loading dashboard")
  }
}
