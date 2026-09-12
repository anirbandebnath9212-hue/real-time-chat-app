import { io } from "socket.io-client";

const socket = io(
    "https://real-time-chat-app-hgdr.onrender.com"
);

export default socket;