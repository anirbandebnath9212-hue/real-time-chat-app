const express = require("express");

const {
    sendMessage,
    getMessages,
    markMessagesAsRead
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Send message
router.post(
    "/",
    protect,
    sendMessage
);


// Get messages
router.get(
    "/:conversationId",
    protect,
    getMessages
);


// Mark messages as read
router.patch(
    "/read/:conversationId",
    protect,
    markMessagesAsRead
);


module.exports = router;