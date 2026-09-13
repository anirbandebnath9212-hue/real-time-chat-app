const express = require("express");

const {
    sendMessage,
    getMessages,
    markMessagesAsRead,
    deleteMessage,
    editMessage
} = require("../controllers/messageController");

const protect =
    require("../middleware/authMiddleware");

const router =
    express.Router();


// =========================
// SEND MESSAGE
// =========================

router.post(
    "/",
    protect,
    sendMessage
);


// =========================
// GET MESSAGES
// =========================

router.get(
    "/:conversationId",
    protect,
    getMessages
);


// =========================
// MARK AS READ
// =========================

router.patch(
    "/read/:conversationId",
    protect,
    markMessagesAsRead
);


// =========================
// DELETE MESSAGE
// =========================

router.delete(
    "/:id",
    protect,
    deleteMessage
);


module.exports = router;

// =========================
// EDIT MESSAGE
// =========================

router.patch(
    "/:id",
    protect,
    editMessage
);