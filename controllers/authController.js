const User = require("../models/User")
const Employee = require("../models/Employee")

const otpStore = new Map()

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" })
    }

    const otp = generateOTP()
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 }) // 10 minutes

    // In production, send email via nodemailer or email service
    console.log(`OTP for ${email}: ${otp}`)

    res.json({ success: true, message: "OTP sent to email" })
  } catch (error) {
    console.error("Send OTP error:", error)
    res.status(500).json({ error: "Failed to send OTP" })
  }
}

exports.getSignup = (req, res) => {
  res.render("auth/signup", { error: null })
}

exports.postSignup = async (req, res) => {
  try {
    const { employeeId, email, password, confirmPassword, role, otp } = req.body

    // Validation
    if (password !== confirmPassword) {
      return res.render("auth/signup", { error: "Passwords do not match" })
    }

    if (password.length < 8) {
      return res.render("auth/signup", { error: "Password must be at least 8 characters" })
    }

    const weakPatterns = [/^12345/, /^abcd/i, /^password/i, /^qwerty/i, /^[0-9]+$/, /^[a-z]+$/i]

    if (weakPatterns.some((pattern) => pattern.test(password))) {
      return res.render("auth/signup", { error: "Password is too weak. Use a mix of letters, numbers, and symbols" })
    }

    const storedOTP = otpStore.get(email)
    if (!storedOTP || storedOTP.otp !== otp || storedOTP.expires < Date.now()) {
      return res.render("auth/signup", { error: "Invalid or expired verification code" })
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] })
    if (existingUser) {
      return res.render("auth/signup", { error: "User already exists" })
    }

    // Create user
    const user = await User.create({
      employeeId,
      email,
      password,
      role: role || "employee",
      isEmailVerified: true, // Verified via OTP
    })

    await Employee.create({
      userId: user._id,
      personalDetails: {},
    })

    otpStore.delete(email)

    res.redirect("/login")
  } catch (error) {
    console.error("Signup error:", error)
    res.render("auth/signup", { error: "Registration failed" })
  }
}

exports.getLogin = (req, res) => {
  res.render("auth/login", { error: null })
}

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.render("auth/login", { error: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.render("auth/login", { error: "Invalid credentials" })
    }

    // Set session
    req.session.user = {
      id: user._id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
    }

    res.redirect("/dashboard")
  } catch (error) {
    console.error("Login error:", error)
    res.render("auth/login", { error: "Login failed" })
  }
}

exports.logout = (req, res) => {
  req.session.destroy()
  res.redirect("/login")
}
