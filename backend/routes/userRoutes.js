const express = require("express");

const {
    getAllUsers,
    getUserById
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Get all users
router.get("/", protect, getAllUsers);


// Get user by ID
router.get("/:id", protect, getUserById);


module.exports = router;