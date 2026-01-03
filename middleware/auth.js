// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login")
  }
  next()
}

// Role-based authorization
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/login")
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: "Access denied" })
    }
    next()
  }
}

module.exports = { requireAuth, requireRole }
