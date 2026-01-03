const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const path = require("path")
require("dotenv").config()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dayflow-hrms-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/hrms",
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
)

// Set view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  next()
})

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hrms")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/", require("./routes/auth"))
app.use("/dashboard", require("./routes/dashboard"))
app.use("/employees", require("./routes/employees"))
app.use("/attendance", require("./routes/attendance"))
app.use("/leave", require("./routes/leave"))

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
