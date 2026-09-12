const express = require("express");

const {
    createConversation,
    getMyConversations,
    getConversationById
} = require("../controllers/conversationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create conversation
router.post("/", protect, createConversation);


// Get my conversations
router.get("/", protect, getMyConversations);


// Get conversation by ID
router.get("/:id", protect, getConversationById);


module.exports = router;