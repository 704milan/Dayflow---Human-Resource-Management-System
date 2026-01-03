const Attendance = require("../models/Attendance")
const Employee = require("../models/Employee")
const Leave = require("../models/Leave")

exports.getAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.session.user.id })
    if (!employee) {
      return res.status(404).send("Employee profile not found")
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const attendance = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 })

    // Check if already checked in today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    })

    res.render("attendance/index", {
      attendance,
      todayAttendance,
      employee,
    })
  } catch (error) {
    console.error("Attendance error:", error)
    res.status(500).send("Error loading attendance")
  }
}

exports.checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.session.user.id })
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" })
    }

    // Check if already checked in today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existingAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    })

    if (existingAttendance) {
      return res.status(400).json({ error: "Already checked in today" })
    }

    // Create attendance record
    const attendance = await Attendance.create({
      employeeId: employee._id,
      date: new Date(),
      checkIn: new Date(),
      status: "present",
    })

    res.json({ success: true, attendance })
  } catch (error) {
    console.error("Check-in error:", error)
    res.status(500).json({ error: "Error checking in" })
  }
}

exports.checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.session.user.id })
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" })
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    })

    if (!attendance) {
      return res.status(404).json({ error: "No check-in found for today" })
    }

    if (attendance.checkOut) {
      return res.status(400).json({ error: "Already checked out" })
    }

    attendance.checkOut = new Date()
    await attendance.save()

    res.json({ success: true, attendance })
  } catch (error) {
    console.error("Check-out error:", error)
    res.status(500).json({ error: "Error checking out" })
  }
}

// Admin functions
exports.getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query
    const targetDate = date ? new Date(date) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const allEmployees = await Employee.find().populate("userId")

    // Get attendance records for the date
    const attendanceRecords = await Attendance.find({
      date: { $gte: targetDate, $lt: nextDay },
    })
      .populate({
        path: "employeeId",
        populate: { path: "userId" },
      })
      .sort({ createdAt: -1 })

    // Get approved leaves for the date
    const approvedLeaves = await Leave.find({
      status: "approved",
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
    }).populate("employeeId")

    // Create a map of employee attendance
    const attendanceMap = new Map()
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.employeeId._id.toString(), record)
    })

    // Create a map of employees on leave
    const leaveMap = new Map()
    approvedLeaves.forEach((leave) => {
      leaveMap.set(leave.employeeId._id.toString(), leave)
    })

    // Build final attendance list with all employees
    const attendance = allEmployees.map((employee) => {
      const employeeId = employee._id.toString()
      const existingAttendance = attendanceMap.get(employeeId)
      const onLeave = leaveMap.get(employeeId)

      if (existingAttendance) {
        // If on leave, update status
        if (onLeave) {
          existingAttendance.status = "on-leave"
        }
        return existingAttendance
      } else if (onLeave) {
        // Create attendance record for employee on leave
        return {
          _id: null,
          employeeId: employee,
          date: targetDate,
          checkIn: null,
          checkOut: null,
          status: "on-leave",
          remarks: `On ${onLeave.leaveType} leave`,
        }
      } else {
        // Create absent record for employee with no attendance
        return {
          _id: null,
          employeeId: employee,
          date: targetDate,
          checkIn: null,
          checkOut: null,
          status: "absent",
          remarks: null,
        }
      }
    })

    res.render("attendance/admin", {
      attendance,
      selectedDate: targetDate,
    })
  } catch (error) {
    console.error("Admin attendance error:", error)
    res.status(500).send("Error loading attendance")
  }
}

exports.updateAttendance = async (req, res) => {
  try {
    const { status, remarks } = req.body
    const attendance = await Attendance.findById(req.params.id)

    if (!attendance) {
      return res.status(404).json({ error: "Attendance not found" })
    }

    attendance.status = status
    attendance.remarks = remarks
    await attendance.save()

    res.json({ success: true, attendance })
  } catch (error) {
    console.error("Update attendance error:", error)
    res.status(500).json({ error: "Error updating attendance" })
  }
}
