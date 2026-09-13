const Message = require("../models/Message");
const Conversation = require("../models/Conversation");


// =========================
// SEND MESSAGE
// =========================

const sendMessage = async (req, res) => {

    try {

        const {
            conversationId,
            text,
            replyTo,
            type,
            fileUrl,
            fileName,
            fileSize
        } = req.body;


        // =========================
        // CHECK CONVERSATION
        // =========================

        const conversation =
            await Conversation.findById(
                conversationId
            );

        if (!conversation) {

            return res.status(404).json({
                message:
                    "Conversation not found"
            });

        }


        // =========================
        // CHECK MESSAGE CONTENT
        // =========================

        const isMediaMessage =
            type &&
            type !== "text" &&
            fileUrl;

        const isTextMessage =
            text &&
            text.trim();


        if (
            !isTextMessage &&
            !isMediaMessage
        ) {

            return res.status(400).json({
                message:
                    "Message text or file is required"
            });

        }


        // =========================
        // CHECK REPLY
        // =========================

        if (replyTo) {

            const replyMessage =
                await Message.findById(
                    replyTo
                );

            if (!replyMessage) {

                return res.status(404).json({
                    message:
                        "Reply message not found"
                });

            }


            if (
                replyMessage.conversationId.toString() !==
                conversationId.toString()
            ) {

                return res.status(400).json({
                    message:
                        "Invalid reply message"
                });

            }

        }


        // =========================
        // CREATE MESSAGE
        // =========================

        const message =
            await Message.create({

                conversationId,

                sender:
                    req.user,

                type:
                    type || "text",

                text:
                    text
                        ? text.trim()
                        : "",

                fileUrl:
                    fileUrl || "",

                fileName:
                    fileName || "",

                fileSize:
                    fileSize || 0,

                replyTo:
                    replyTo || null

            });


        // =========================
        // UPDATE LAST MESSAGE
        // =========================

        conversation.lastMessage =
            message._id;

        await conversation.save();


        // =========================
        // POPULATE MESSAGE
        // =========================

        const populatedMessage =
            await Message
                .findById(
                    message._id
                )
                .populate(
                    "sender",
                    "-password"
                )
                .populate({
                    path: "replyTo",

                    populate: {
                        path: "sender",
                        select: "-password"
                    }
                });


        // =========================
        // SOCKET.IO
        // =========================

        const io =
            req.app.get("io");


        io.to(
            conversationId.toString()
        ).emit(
            "newMessage",
            populatedMessage
        );


        conversation.participants.forEach(
            (participantId) => {

                io.to(
                    participantId.toString()
                ).emit(
                    "newMessage",
                    populatedMessage
                );

            }
        );


        // =========================
        // RESPONSE
        // =========================

        res.status(201).json({

            message:
                "Message sent successfully",

            data:
                populatedMessage

        });


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// =========================
// GET MESSAGES
// =========================

const getMessages = async (req, res) => {

    try {

        const messages =
            await Message
                .find({
                    conversationId:
                        req.params.conversationId
                })
                .populate(
                    "sender",
                    "-password"
                )
                .populate({
                    path: "replyTo",

                    populate: {
                        path: "sender",
                        select: "-password"
                    }
                })
                .sort({
                    createdAt: 1
                });


        res.status(200).json({
            messages
        });


    } catch (error) {

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// =========================
// MARK MESSAGES AS READ
// =========================

const markMessagesAsRead = async (req, res) => {

    try {

        const conversationId =
            req.params.conversationId;


        const messages =
            await Message.find({

                conversationId,

                sender: {
                    $ne: req.user
                },

                read: false

            });


        if (messages.length === 0) {

            return res.status(200).json({

                message:
                    "No unread messages"

            });

        }


        await Message.updateMany(

            {

                conversationId,

                sender: {
                    $ne: req.user
                },

                read: false

            },

            {

                $set: {
                    read: true
                }

            }

        );


        const io =
            req.app.get("io");


        io.to(
            conversationId.toString()
        ).emit(

            "messagesRead",

            {
                conversationId,

                userId:
                    req.user
            }

        );


        res.status(200).json({

            message:
                "Messages marked as read",

            count:
                messages.length

        });


    } catch (error) {

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// =========================
// DELETE MESSAGE
// =========================

const deleteMessage = async (req, res) => {

    try {

        const messageId =
            req.params.id;


        const message =
            await Message.findById(
                messageId
            );


        if (!message) {

            return res.status(404).json({

                message:
                    "Message not found"

            });

        }


        if (
            message.sender.toString() !==
            req.user.toString()
        ) {

            return res.status(403).json({

                message:
                    "You can only delete your own messages"

            });

        }


        const conversationId =
            message.conversationId;


        await Message.findByIdAndDelete(
            messageId
        );


        const conversation =
            await Conversation.findById(
                conversationId
            );


        if (
            conversation &&
            conversation.lastMessage?.toString() ===
            messageId.toString()
        ) {

            const previousMessage =
                await Message
                    .findOne({
                        conversationId
                    })
                    .sort({
                        createdAt: -1
                    });


            conversation.lastMessage =
                previousMessage
                    ? previousMessage._id
                    : null;


            await conversation.save();

        }


        const io =
            req.app.get("io");


        io.to(
            conversationId.toString()
        ).emit(

            "messageDeleted",

            {
                messageId,

                conversationId
            }

        );


        res.status(200).json({

            message:
                "Message deleted successfully",

            messageId

        });


    } catch (error) {

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// =========================
// EDIT MESSAGE
// =========================

const editMessage = async (req, res) => {

    try {

        const messageId =
            req.params.id;

        const { text } =
            req.body;


        const message =
            await Message.findById(
                messageId
            );


        if (!message) {

            return res.status(404).json({

                message:
                    "Message not found"

            });

        }


        if (
            message.sender.toString() !==
            req.user.toString()
        ) {

            return res.status(403).json({

                message:
                    "You can only edit your own messages"

            });

        }


        if (
            !text ||
            !text.trim()
        ) {

            return res.status(400).json({

                message:
                    "Message text is required"

            });

        }


        message.text =
            text.trim();


        await message.save();


        const io =
            req.app.get("io");


        io.to(
            message.conversationId.toString()
        ).emit(

            "messageEdited",

            message

        );


        res.status(200).json({

            message:
                "Message edited successfully",

            data:
                message

        });


    } catch (error) {

        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

};


module.exports = {

    sendMessage,

    getMessages,

    markMessagesAsRead,

    deleteMessage,

    editMessage

};