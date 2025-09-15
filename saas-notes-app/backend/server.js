const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./src/config/db");
const { errorHandler, notFound } = require("./src/middlewares/errorHandler");

const authRoutes = require("./src/routes/auth");
const notesRoutes = require("./src/routes/notes");
const tenantsRoutes = require("./src/routes/tenants");
const healthRoutes = require("./src/routes/health");

const Tenant = require("./src/models/Tenant");
const User = require("./src/models/User");
const Note = require("./src/models/Note");

const bcrypt = require("bcryptjs");

const app = express();

// Security
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// CORS - Enable for all origins as required
app.use(
  cors({
    origin: true, // Allow all origins for automated testing
    credentials: true,
  })
);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/tenants", tenantsRoutes);

// Root
app.get("/", (req, res) => {
  res.json({ 
    status: "running", 
    service: "YardStick Notes API v2",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      notes: "/api/notes",
      tenants: "/api/tenants"
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Seeder - Create initial data
async function seedInitialData() {
  try {
    const existingTenants = await Tenant.countDocuments();
    if (existingTenants > 0) {
      console.log("📊 Data already exists, skipping seed");
      return;
    }

    console.log("🌱 Seeding initial data...");

    // Create tenants
    const acme = await Tenant.create({ 
      name: "Acme Corp", 
      slug: "acme",
      subscription: "free"
    });
    const globex = await Tenant.create({ 
      name: "Globex Inc", 
      slug: "globex",
      subscription: "free"
    });

    // Hash passwords
    const hashedPassword = await bcrypt.hash("password", 12);

    // Create users
    const users = await User.insertMany([
      {
        email: "admin@acme.test",
        password: hashedPassword,
        role: "admin",
        tenantId: acme._id,
        isActive: true
      },
      {
        email: "user@acme.test",
        password: hashedPassword,
        role: "member",
        tenantId: acme._id,
        isActive: true
      },
      {
        email: "admin@globex.test",
        password: hashedPassword,
        role: "admin",
        tenantId: globex._id,
        isActive: true
      },
      {
        email: "user@globex.test",
        password: hashedPassword,
        role: "member",
        tenantId: globex._id,
        isActive: true
      },
    ]);

    console.log("✅ Seed data created:");
    console.log(`   - Tenants: ${acme.name} (${acme.slug}), ${globex.name} (${globex.slug})`);
    console.log(`   - Users: ${users.length} users created`);
    console.log("   - Test accounts (password: 'password'):");
    users.forEach(user => {
      console.log(`     * ${user.email} (${user.role})`);
    });
  } 
  catch (err) {
    console.error("❌ Seed error:", err.message);
  }
}

// Start server
const start = async () => {
  try {
    await connectDB();
    await seedInitialData();
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 API running at http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Test login: POST http://localhost:${PORT}/api/auth/login`);
    });
  } catch (err) {
    console.error("Server start error:", err);
    process.exit(1);
  }
};

if (require.main === module) start();

module.exports = app;
