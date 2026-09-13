const express = require("express");

const {
    getAllUsers,
    getUserById,
    updateProfile
} = require("../controllers/userController");

const protect =
    require("../middleware/authMiddleware");

const router =
    express.Router();


// =========================
// GET ALL USERS
// =========================

router.get(
    "/",
    protect,
    getAllUsers
);


// =========================
// UPDATE MY PROFILE
// =========================

router.patch(
    "/profile",
    protect,
    updateProfile
);


// =========================
// GET USER BY ID
// =========================

router.get(
    "/:id",
    protect,
    getUserById
);


module.exports = router;