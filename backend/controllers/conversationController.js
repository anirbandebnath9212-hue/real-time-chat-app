const Conversation = require("../models/Conversation");
const Message = require("../models/Message");


// =========================
// CREATE CONVERSATION
// =========================

const createConversation = async (req, res) => {

    try {

        const { userId } = req.body;

        const existingConversation =
            await Conversation.findOne({

                participants: {
                    $all: [
                        req.user,
                        userId
                    ]
                }

            });


        if (existingConversation) {

            return res.status(200).json({

                message:
                    "Conversation already exists",

                conversation:
                    existingConversation

            });

        }


        const conversation =
            await Conversation.create({

                participants: [
                    req.user,
                    userId
                ]

            });


        res.status(201).json({

            message:
                "Conversation created successfully",

            conversation

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
// GET MY CONVERSATIONS
// =========================

const getMyConversations = async (req, res) => {

    try {

        const conversations =
            await Conversation
                .find({
                    participants: req.user
                })

                .populate(
                    "participants",
                    "-password"
                )

                .populate(
                    "lastMessage"
                )

                .sort({
                    updatedAt: -1
                });


        // Add unread message count
        const conversationsWithUnreadCount =
            await Promise.all(

                conversations.map(
                    async (conversation) => {

                        const unreadCount =
                            await Message.countDocuments({

                                conversationId:
                                    conversation._id,

                                sender: {
                                    $ne: req.user
                                },

                                read: false

                            });


                        return {

                            ...conversation.toObject(),

                            unreadCount

                        };

                    }
                )

            );


        res.status(200).json({

            conversations:
                conversationsWithUnreadCount

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
// GET CONVERSATION BY ID
// =========================

const getConversationById = async (req, res) => {

    try {

        const conversation =
            await Conversation
                .findById(req.params.id)

                .populate(
                    "participants",
                    "-password"
                )

                .populate(
                    "lastMessage"
                );


        if (!conversation) {

            return res.status(404).json({

                message:
                    "Conversation not found"

            });

        }


        res.status(200).json({

            conversation

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

    createConversation,
    getMyConversations,
    getConversationById

};