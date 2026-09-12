const User = require("../models/User");


// GET ALL USERS
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
            message: "Server error",
            error: error.message
        });
    }
};


// GET USER BY ID
const getUserById = async (req, res) => {
    try {
        const user = await User
            .findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    getAllUsers,
    getUserById
};