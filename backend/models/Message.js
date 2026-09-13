const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Message type
        type: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "file"
            ],
            default: "text"
        },

        // Text message
        text: {
            type: String,
            trim: true,
            default: ""
        },

        // Uploaded file URL
        fileUrl: {
            type: String,
            default: ""
        },

        // Original file name
        fileName: {
            type: String,
            default: ""
        },

        // File size in bytes
        fileSize: {
            type: Number,
            default: 0
        },

        // Message this message is replying to
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },

        // Read status
        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Message = mongoose.model(
    "Message",
    messageSchema
);

module.exports = Message;