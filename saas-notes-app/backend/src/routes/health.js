const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// GET /api/health - Health check endpoint
router.get("/", async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        readyState: dbState
      },
      environment: process.env.NODE_ENV || 'development',
      version: "1.0.0"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message
    });
  }
});

module.exports = router;