const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
require("dotenv").config()

const User = require("../models/User")
const Employee = require("../models/Employee")
const Attendance = require("../models/Attendance")
const Leave = require("../models/Leave")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hrms"

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Employee.deleteMany({})
    await Attendance.deleteMany({})
    await Leave.deleteMany({})
    console.log("Cleared existing data")

    // Create Admin user
    const adminUser = await User.create({
      employeeId: "EMP001",
      email: "admin@dayflow.com",
      password: "Admin@123",
      role: "admin",
      isEmailVerified: true,
    })

    await Employee.create({
      userId: adminUser._id,
      personalDetails: {
        firstName: "Admin",
        lastName: "User",
        phone: "+1234567890",
        address: "123 Admin Street, City, Country",
      },
      jobDetails: {
        position: "System Administrator",
        department: "IT",
        employmentType: "full-time",
      },
      salaryDetails: {
        baseSalary: 80000,
        allowances: 10000,
        deductions: 5000,
      },
    })

    console.log("Created admin user: admin@dayflow.com / Admin@123")

    // Create sample employees
    const employees = [
      {
        employeeId: "EMP002",
        email: "john.doe@dayflow.com",
        firstName: "John",
        lastName: "Doe",
        position: "Software Engineer",
        department: "Engineering",
        baseSalary: 70000,
      },
      {
        employeeId: "EMP003",
        email: "jane.smith@dayflow.com",
        firstName: "Jane",
        lastName: "Smith",
        position: "Product Manager",
        department: "Product",
        baseSalary: 75000,
      },
      {
        employeeId: "EMP004",
        email: "mike.johnson@dayflow.com",
        firstName: "Mike",
        lastName: "Johnson",
        position: "Designer",
        department: "Design",
        baseSalary: 65000,
      },
    ]

    for (const emp of employees) {
      const user = await User.create({
        employeeId: emp.employeeId,
        email: emp.email,
        password: "Employee@123",
        role: "employee",
        isEmailVerified: true,
      })

      await Employee.create({
        userId: user._id,
        personalDetails: {
          firstName: emp.firstName,
          lastName: emp.lastName,
          phone: "+1234567890",
          address: "456 Employee St, City, Country",
        },
        jobDetails: {
          position: emp.position,
          department: emp.department,
          employmentType: "full-time",
        },
        salaryDetails: {
          baseSalary: emp.baseSalary,
          allowances: 5000,
          deductions: 2000,
        },
      })

      console.log(`Created employee: ${emp.email} / Employee@123`)
    }

    console.log("\nSeeding completed successfully!")
    console.log("\nLogin credentials:")
    console.log("Admin: admin@dayflow.com / Admin@123")
    console.log("Employee: john.doe@dayflow.com / Employee@123")

    process.exit(0)
  } catch (error) {
    console.error("Seeding error:", error)
    process.exit(1)
  }
}

seed()
