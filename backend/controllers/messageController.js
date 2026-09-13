const Message = require("../models/Message");
const Conversation = require("../models/Conversation");


// =========================
// SEND MESSAGE
// =========================

const sendMessage = async (req, res) => {

    try {

        const {
            conversationId,
            text
        } = req.body;


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


        const message =
            await Message.create({

                conversationId,

                sender:
                    req.user,

                text

            });


        conversation.lastMessage =
            message._id;


        await conversation.save();


        const io =
            req.app.get("io");


        // Send to conversation room

        io.to(
            conversationId.toString()
        ).emit(
            "newMessage",
            message
        );


        // Send to personal rooms

        conversation.participants.forEach(
            (participantId) => {

                io.to(
                    participantId.toString()
                ).emit(
                    "newMessage",
                    message
                );

            }
        );


        res.status(201).json({

            message:
                "Message sent successfully",

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

                conversationId:
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

                conversationId:
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

                conversationId:
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


        // Find message

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


        // Make sure the logged-in user
        // owns this message

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


        // Delete message

        await Message.findByIdAndDelete(
            messageId
        );


        // Update last message

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
                        conversationId:
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


        // Socket.IO

        const io =
            req.app.get("io");


        io.to(
            conversationId.toString()
        ).emit(

            "messageDeleted",

            {

                messageId:
                    messageId,

                conversationId:
                    conversationId

            }

        );


        res.status(200).json({

            message:
                "Message deleted successfully",

            messageId:
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


        // Find message

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


        // Make sure the logged-in user
        // owns this message

        if (
            message.sender.toString() !==
            req.user.toString()
        ) {

            return res.status(403).json({

                message:
                    "You can only edit your own messages"

            });

        }


        // Check text

        if (!text || !text.trim()) {

            return res.status(400).json({

                message:
                    "Message text is required"

            });

        }


        // Update message

        message.text =
            text.trim();


        await message.save();


        // Socket.IO

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

// =========================
// EXPORT
// =========================

module.exports = {

    sendMessage,

    getMessages,

    markMessagesAsRead,

    deleteMessage,

    editMessage
};