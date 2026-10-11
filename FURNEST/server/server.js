const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const petRoutes = require("./src/routes/petRoutes");
const postRoutes = require("./src/routes/postRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const userRoutes = require("./src/routes/userRoutes");

// NEW: Booking routes
const bookingRoutes = require("./src/routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();


// ============================================================
// HOME
// ============================================================

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to FURNEST API"
    });
});


// ============================================================
// API ROUTES
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/pets", petRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/chats", chatRoutes);

app.use("/api/users", userRoutes);

// NEW: Booking API
app.use("/api/bookings", bookingRoutes);


// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`FURNEST server running on port ${PORT}`);
});