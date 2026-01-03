const Employee = require("../models/Employee")
const User = require("../models/User")

exports.getProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.session.user.id }).populate("userId")
    if (!employee) {
      return res.status(404).send("Employee profile not found")
    }
    res.render("employees/profile", { employee, editable: false })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).send("Error loading profile")
  }
}

exports.getEditProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.session.user.id })
    if (!employee) {
      return res.status(404).send("Employee profile not found")
    }
    res.render("employees/edit-profile", { employee, error: null })
  } catch (error) {
    console.error("Edit profile error:", error)
    res.status(500).send("Error loading profile")
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { phone, address, profilePicture } = req.body
    const employee = await Employee.findOne({ userId: req.session.user.id })

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" })
    }

    // Update only allowed fields for employees
    if (phone !== undefined) {
      employee.personalDetails.phone = phone
    }
    if (address !== undefined) {
      employee.personalDetails.address = address
    }
    if (profilePicture !== undefined && profilePicture !== "") {
      employee.personalDetails.profilePicture = profilePicture
    }

    await employee.save()
    res.redirect("/employees/profile")
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).send("Error updating profile")
  }
}

// Admin functions
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("userId").sort({ createdAt: -1 })
    res.render("employees/list", { employees })
  } catch (error) {
    console.error("Get employees error:", error)
    res.status(500).send("Error loading employees")
  }
}

exports.getEmployeeDetails = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("userId")
    if (!employee) {
      return res.status(404).send("Employee not found")
    }
    res.render("employees/details", { employee })
  } catch (error) {
    console.error("Employee details error:", error)
    res.status(500).send("Error loading employee")
  }
}

exports.getEditEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
    if (!employee) {
      return res.status(404).send("Employee not found")
    }
    res.render("employees/edit", { employee, error: null })
  } catch (error) {
    console.error("Edit employee error:", error)
    res.status(500).send("Error loading employee")
  }
}

exports.updateEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      position,
      department,
      employmentType,
      baseSalary,
      allowances,
      deductions,
    } = req.body

    const employee = await Employee.findById(req.params.id)
    if (!employee) {
      return res.status(404).send("Employee not found")
    }

    // Update all fields (admin privilege)
    employee.personalDetails.firstName = firstName
    employee.personalDetails.lastName = lastName
    employee.personalDetails.phone = phone
    employee.personalDetails.address = address
    employee.jobDetails.position = position
    employee.jobDetails.department = department
    employee.jobDetails.employmentType = employmentType
    employee.salaryDetails.baseSalary = baseSalary
    employee.salaryDetails.allowances = allowances
    employee.salaryDetails.deductions = deductions

    await employee.save()
    res.redirect(`/employees/${employee._id}`)
  } catch (error) {
    console.error("Update employee error:", error)
    res.status(500).send("Error updating employee")
  }
}

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" })
    }

    // Delete user account and employee profile
    await User.findByIdAndDelete(employee.userId)
    await Employee.findByIdAndDelete(req.params.id)

    res.redirect("/employees")
  } catch (error) {
    console.error("Delete employee error:", error)
    res.status(500).json({ error: "Error deleting employee" })
  }
}
