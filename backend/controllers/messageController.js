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


        // Find conversation

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


        // Create message

        const message =
            await Message.create({

                conversationId,

                sender:
                    req.user,

                text

            });


        // Update latest message

        conversation.lastMessage =
            message._id;


        await conversation.save();


        // Get Socket.IO

        const io =
            req.app.get("io");


        // =========================
        // SEND TO CONVERSATION ROOM
        // =========================

        io.to(
            conversationId.toString()
        ).emit(
            "newMessage",
            message
        );


        // =========================
        // SEND TO PERSONAL ROOMS
        // =========================

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


        // =========================
        // RESPONSE
        // =========================

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


        // Find unread messages
        // that were not sent by me

        const messages =
            await Message.find({

                conversationId:
                    conversationId,

                sender: {
                    $ne: req.user
                },

                read: false

            });


        // No unread messages

        if (messages.length === 0) {

            return res.status(200).json({

                message:
                    "No unread messages"

            });

        }


        // Mark messages as read

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


        // Get Socket.IO

        const io =
            req.app.get("io");


        // Tell conversation
        // that messages were read

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


        // Response

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
// EXPORT
// =========================

module.exports = {

    sendMessage,

    getMessages,

    markMessagesAsRead

};