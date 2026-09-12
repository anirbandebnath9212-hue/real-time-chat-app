const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const User = require("./models/User");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();

connectDB();

const app = express();


// =========================
// CREATE HTTP SERVER
// =========================

const server = http.createServer(app);


// =========================
// SOCKET.IO
// =========================

const io = new Server(server, {

    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }

});


// Make Socket.IO available
// inside controllers

app.set("io", io);


// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());


// =========================
// ROUTES
// =========================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/conversations",
    conversationRoutes
);

app.use(
    "/api/messages",
    messageRoutes
);


// =========================
// BASIC ROUTE
// =========================

app.get("/", (req, res) => {

    res.json({

        message:
            "Real-Time Chat App Backend is running"

    });

});


// =========================
// SOCKET.IO CONNECTION
// =========================

io.on("connection", (socket) => {

    console.log(
        "User connected:",
        socket.id
    );


    // =========================
    // USER COMES ONLINE
    // =========================

    socket.on(
        "userOnline",
        async (userId) => {

            try {

                await User.findByIdAndUpdate(
                    userId,
                    {
                        isOnline: true
                    }
                );


                // Store user ID
                // on this socket

                socket.userId =
                    userId;


                // Join personal
                // user room

                socket.join(
                    userId.toString()
                );


                console.log(
                    `User ${userId} is online`
                );

                console.log(
                    `User ${userId} joined personal room`
                );


            } catch (error) {

                console.log(
                    "Failed to update online status:",
                    error.message
                );

            }

        }
    );


    // =========================
    // JOIN CONVERSATION
    // =========================

    socket.on(
        "joinConversation",
        (conversationId) => {

            socket.join(
                conversationId.toString()
            );


            console.log(
                `Socket ${socket.id} joined conversation ${conversationId}`
            );

        }
    );


    // =========================
    // USER STARTS TYPING
    // =========================

    socket.on(
        "typing",
        (conversationId) => {

            socket
                .to(conversationId.toString())
                .emit(
                    "userTyping"
                );

        }
    );


    // =========================
    // USER STOPS TYPING
    // =========================

    socket.on(
        "stopTyping",
        (conversationId) => {

            socket
                .to(conversationId.toString())
                .emit(
                    "userStoppedTyping"
                );

        }
    );


    // =========================
    // USER DISCONNECTS
    // =========================

    socket.on(
        "disconnect",
        async () => {

            console.log(
                "User disconnected:",
                socket.id
            );


            // Mark correct user offline

            if (socket.userId) {

                try {

                    await User.findByIdAndUpdate(
                        socket.userId,
                        {
                            isOnline: false
                        }
                    );


                    console.log(
                        `User ${socket.userId} is offline`
                    );


                } catch (error) {

                    console.log(
                        "Failed to update offline status:",
                        error.message
                    );

                }

            }

        }
    );

});


// =========================
// START SERVER
// =========================

const PORT =
    process.env.PORT || 5000;


server.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);