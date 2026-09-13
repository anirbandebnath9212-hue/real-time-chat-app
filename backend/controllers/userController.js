const User = require("../models/User");


// =========================
// GET ALL USERS
// =========================

const getAllUsers = async (req, res) => {

    try {

        const users = await User
            .find()
            .select("-password");


        res.status(200).json({
            users
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
// GET USER BY ID
// =========================

const getUserById = async (req, res) => {

    try {

        const user = await User
            .findById(req.params.id)
            .select("-password");


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        res.status(200).json({

            user

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
// UPDATE MY PROFILE
// =========================

const updateProfile = async (req, res) => {

    try {

        const {
            username
        } = req.body;


        // Find logged-in user

        const user =
            await User.findById(
                req.user
            );


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        // Check username

        if (!username || !username.trim()) {

            return res.status(400).json({

                message:
                    "Username is required"

            });

        }


        // Check if username
        // already belongs to another user

        const existingUser =
            await User.findOne({

                username:
                    username.trim(),

                _id: {
                    $ne: req.user
                }

            });


        if (existingUser) {

            return res.status(400).json({

                message:
                    "Username already taken"

            });

        }


        // Update username

        user.username =
            username.trim();


        await user.save();


        // Send updated user
        // without password

        res.status(200).json({

            message:
                "Profile updated successfully",

            user: {

                id:
                    user._id,

                username:
                    user.username,

                email:
                    user.email,

                profilePicture:
                    user.profilePicture,

                isOnline:
                    user.isOnline

            }

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

    getAllUsers,

    getUserById,

    updateProfile

};