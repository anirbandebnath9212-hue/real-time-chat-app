import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function ChatDashboard({ setIsLoggedIn }) {

const [users, setUsers] = useState([]);
const [conversations, setConversations] = useState([]);    
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Typing indicator
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

    // Timer for typing
    const typingTimeoutRef = useRef(null);

    // Auto-scroll
    const messagesEndRef = useRef(null);


    // =========================
    // FORMAT MESSAGE TIME
    // =========================

    const formatMessageTime = (date) => {

        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    };


    // =========================
    // AUTO SCROLL
    // =========================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    // =========================
    // SOCKET CONNECTION
    // =========================

    useEffect(() => {

        const handleConnect = () => {

            console.log(
                "Socket connected:",
                socket.id
            );

            if (selectedConversation) {

                socket.emit(
                    "joinConversation",
                    selectedConversation._id
                );

            }

        };

        socket.on(
            "connect",
            handleConnect
        );

        return () => {

            socket.off(
                "connect",
                handleConnect
            );

        };

    }, [selectedConversation]);


    // =========================
    // RECEIVE NEW MESSAGE
useEffect(() => {

    const handleNewMessage = (message) => {

        console.log(
            "New message received:",
            message
        );


        // UPDATE SIDEBAR
setConversations((previousConversations) => {

    return previousConversations.map(
        (conversation) => {

            if (
                conversation._id.toString() ===
                message.conversationId.toString()
            ) {

                // Check if message is from me
                const senderId =
                    message.sender?._id ||
                    message.sender;

                const isMyMessage =
                    currentUser &&
                    senderId.toString() ===
                    currentUser._id.toString();


                return {
                    ...conversation,

                    // Update latest message
                    lastMessage: message,

                    // Increase unread count
                    // only when message is from the other user
                    unreadCount:
                        isMyMessage
                            ? conversation.unreadCount
                            : conversation.unreadCount + 1
                };

            }

            return conversation;

        }
    );

});


        // CHECK CURRENT CHAT

        if (
            !selectedConversation ||
            message.conversationId.toString() !==
            selectedConversation._id.toString()
        ) {

            return;

        }


        // ADD MESSAGE TO CURRENT CHAT

        setMessages((previousMessages) => {

            const alreadyExists =
                previousMessages.some(
                    (previousMessage) =>
                        previousMessage._id ===
                        message._id
                );

            if (alreadyExists) {
                return previousMessages;
            }

            return [
                ...previousMessages,
                message
            ];

        });

    };


    socket.on(
        "newMessage",
        handleNewMessage
    );


    return () => {

        socket.off(
            "newMessage",
            handleNewMessage
        );

    };

}, [selectedConversation]);


    // MESSAGES READ
useEffect(() => {

    const handleMessagesRead = (data) => {

        console.log(
            "Messages read:",
            data
        );


        // Update message ticks
        // inside the current chat

        if (
            selectedConversation &&
            data.conversationId.toString() ===
            selectedConversation._id.toString()
        ) {

            setMessages((previousMessages) => {

                return previousMessages.map(
                    (message) => {

                        const senderId =
                            message.sender?._id ||
                            message.sender;


                        const isMyMessage =
                            currentUser &&
                            senderId.toString() ===
                            currentUser._id.toString();


                        if (isMyMessage) {

                            return {
                                ...message,
                                read: true
                            };

                        }


                        return message;

                    }
                );

            });

        }


        // =========================
        // REMOVE UNREAD COUNT
        // =========================

        setConversations(
            (previousConversations) => {

                return previousConversations.map(
                    (conversation) => {

                        if (
                            conversation._id.toString() ===
                            data.conversationId.toString()
                        ) {

                            return {
                                ...conversation,
                                unreadCount: 0
                            };

                        }


                        return conversation;

                    }
                );

            }
        );

    };


    socket.on(
        "messagesRead",
        handleMessagesRead
    );


    return () => {

        socket.off(
            "messagesRead",
            handleMessagesRead
        );

    };


}, [
    selectedConversation,
    currentUser
]);


    // =========================
    // TYPING EVENTS
    // =========================

    useEffect(() => {

        const handleUserTyping = () => {

            console.log(
                "Other user is typing..."
            );

            setIsOtherUserTyping(true);

        };


        const handleUserStoppedTyping = () => {

            console.log(
                "Other user stopped typing"
            );

            setIsOtherUserTyping(false);

        };


        socket.on(
            "userTyping",
            handleUserTyping
        );

        socket.on(
            "userStoppedTyping",
            handleUserStoppedTyping
        );


        return () => {

            socket.off(
                "userTyping",
                handleUserTyping
            );

            socket.off(
                "userStoppedTyping",
                handleUserStoppedTyping
            );

        };

    }, []);


    // =========================
    // GET CURRENT USER
    // =========================

    useEffect(() => {

        const fetchCurrentUser = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    "https://real-time-chat-app-hgdr.onrender.com/api/auth/me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const data =
                    await response.json();

                console.log(
                    "Current user:",
                    data
                );

                if (!response.ok) {

                    localStorage.removeItem(
                        "token"
                    );

                    setIsLoggedIn(false);

                    return;
                }

                setCurrentUser(data.user);

                socket.emit(
                    "userOnline",
                    data.user._id
                );

            } catch (error) {

                console.log(error);

            }

        };

        fetchCurrentUser();

    }, [setIsLoggedIn]);


    // =========================
    // GET ALL USERS
    // =========================

// GET MY CONVERSATIONS
useEffect(() => {

    const fetchConversations = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                "https://real-time-chat-app-hgdr.onrender.com/api/conversations",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            console.log(
                "My conversations:",
                data
            );

            if (!response.ok) {
                return;
            }

            setConversations(
                data.conversations
            );

        } catch (error) {

            console.log(error);

        }

    };

    fetchConversations();

}, []);

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    "https://real-time-chat-app-hgdr.onrender.com/api/users",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const data =
                    await response.json();

                console.log(
                    "All users:",
                    data
                );

                if (!response.ok) {
                    return;
                }

                setUsers(data.users);

            } catch (error) {

                console.log(error);

            }

        };

        fetchUsers();

    }, []);


    // =========================
    // OPEN CONVERSATION
    // =========================

    const handleUserClick = async (user) => {

        try {

            const token =
                localStorage.getItem("token");


            setSelectedUser(user);

            setIsOtherUserTyping(false);


            const response = await fetch(
                "https://real-time-chat-app-hgdr.onrender.com/api/conversations",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        userId: user._id
                    })
                }
            );


            const data =
                await response.json();


            console.log(data);


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to create conversation"
                );

                return;
            }


            const conversation =
                data.conversation;


            setSelectedConversation(
                conversation
            );


            socket.emit(
                "joinConversation",
                conversation._id
            );


            console.log(
                "Joined conversation:",
                conversation._id
            );


            // Get messages
            const messageResponse =
                await fetch(
                    `https://real-time-chat-app-hgdr.onrender.com/api/messages/${conversation._id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const messageData =
                await messageResponse.json();


            console.log(
                "Conversation messages:",
                messageData
            );


            if (!messageResponse.ok) {

                console.log(
                    "Failed to fetch messages"
                );

                return;
            }


            setMessages(
                messageData.messages
            );


            // Mark messages as read
            const readResponse =
                await fetch(
                    `https://real-time-chat-app-hgdr.onrender.com/api/messages/read/${conversation._id}`,
                    {
                        method: "PATCH",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const readData =
                await readResponse.json();


            console.log(
                "Read response:",
                readData
            );


        } catch (error) {

            console.log(error);

        }

    };


    // =========================
    // HANDLE TYPING
    // =========================

    const handleTyping = (e) => {

        const value =
            e.target.value;


        setMessageText(value);


        if (!selectedConversation) {
            return;
        }


        // Clear previous timer
        if (typingTimeoutRef.current) {

            clearTimeout(
                typingTimeoutRef.current
            );

        }


        // If input is empty
        if (!value.trim()) {

            socket.emit(
                "stopTyping",
                selectedConversation._id
            );

            return;
        }


        // Tell other user we are typing
        socket.emit(
            "typing",
            selectedConversation._id
        );


        // Wait 1 second after
        // the last typed character
        typingTimeoutRef.current =
            setTimeout(() => {

                socket.emit(
                    "stopTyping",
                    selectedConversation._id
                );

            }, 1000);

    };


    // =========================
    // SEND MESSAGE
    // =========================

    const handleSendMessage = async () => {

        if (!messageText.trim()) {
            return;
        }


        if (!selectedConversation) {

            alert(
                "Please select a chat first"
            );

            return;
        }


        // Stop typing
        if (typingTimeoutRef.current) {

            clearTimeout(
                typingTimeoutRef.current
            );

        }


        socket.emit(
            "stopTyping",
            selectedConversation._id
        );


        try {

            const token =
                localStorage.getItem("token");


            const response = await fetch(
                "https://real-time-chat-app-hgdr.onrender.com/api/messages",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        conversationId:
                            selectedConversation._id,

                        text:
                            messageText

                    })
                }
            );


            const data =
                await response.json();


            console.log(
                "Send message response:",
                data
            );


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to send message"
                );

                return;
            }


            setMessages((previousMessages) => {

                const alreadyExists =
                    previousMessages.some(
                        (previousMessage) =>
                            previousMessage._id ===
                            data.data._id
                    );


                if (alreadyExists) {
                    return previousMessages;
                }


                return [
                    ...previousMessages,
                    data.data
                ];

            });


            setMessageText("");


        } catch (error) {

            console.log(error);

        }

    };


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("token");

        setIsLoggedIn(false);

    };


    return (

        <div className="chat-dashboard">


            {/* =========================
                SIDEBAR
            ========================== */}

            <div className="sidebar">

                <h2>
                    Chats
                </h2>


                <button
                    onClick={handleLogout}
                >
                    Logout
                </button>


                {users
                    .filter(
                        (user) =>
                            user._id !==
                            currentUser?._id
                    )
                    .map((user) => (

                        <div
                            className="chat-user"
                            key={user._id}
                            onClick={() =>
                                handleUserClick(user)
                            }
                        >

                            <h3>
    {user.username}
</h3>

<p>
    {
        conversations.find(
            (conversation) =>
                conversation.participants.some(
                    (participant) =>
                        participant._id === user._id
                )
        )?.lastMessage?.text || "No messages yet"
    }
</p>

{
    (() => {

        const conversation =
            conversations.find(
                (conversation) =>
                    conversation.participants.some(
                        (participant) =>
                            participant._id === user._id
                    )
            );

        return conversation?.unreadCount > 0 ? (

            <span className="unread-count">
                {conversation.unreadCount}
            </span>

        ) : null;

    })()
}

                            <span
                                className={
                                    user.isOnline
                                        ? "online-status"
                                        : "offline-status"
                                }
                            >

                                {user.isOnline
                                    ? "● Online"
                                    : "○ Offline"}

                            </span>

                        </div>

                    ))}

            </div>


            {/* =========================
                CHAT WINDOW
            ========================== */}

            <div className="chat-window">


                {/* Header */}

                <div className="chat-header">

                    {selectedUser ? (

                        <>

                            <h2>
                                {selectedUser.username}
                            </h2>


                            <span
                                className={
                                    selectedUser.isOnline
                                        ? "online-status"
                                        : "offline-status"
                                }
                            >

                                {selectedUser.isOnline
                                    ? "● Online"
                                    : "○ Offline"}

                            </span>

                        </>

                    ) : (

                        <h2>
                            Select a chat
                        </h2>

                    )}

                </div>


                {/* Messages */}

                <div className="messages">

                    {selectedConversation ? (

                        messages.length > 0 ? (

                            messages.map(
                                (message) => {

                                    const senderId =
                                        message.sender?._id ||
                                        message.sender;


                                    const isMyMessage =
                                        currentUser &&
                                        senderId.toString() ===
                                        currentUser._id.toString();


                                    return (

                                        <div
                                            key={
                                                message._id
                                            }
                                            className={
                                                isMyMessage
                                                    ? "message-row my-message"
                                                    : "message-row other-message"
                                            }
                                        >

                                            <div
                                                className="message-bubble"
                                            >

                                                <strong>

                                                    {isMyMessage
                                                        ? "You"
                                                        : message
                                                              .sender
                                                              ?.username ||
                                                          "User"}

                                                </strong>


                                                <p>
                                                    {
                                                        message.text
                                                    }
                                                </p>


                                                <small>

                                                    {formatMessageTime(
                                                        message.createdAt
                                                    )}


                                                    {isMyMessage && (

                                                        <span
                                                            className={
                                                                message.read
                                                                    ? "message-ticks read"
                                                                    : "message-ticks"
                                                            }
                                                        >
                                                            ✓✓
                                                        </span>

                                                    )}

                                                </small>

                                            </div>

                                        </div>

                                    );

                                }
                            )

                        ) : (

                            <p>
                                No messages yet
                            </p>

                        )

                    ) : (

                        <p>
                            No conversation selected
                        </p>

                    )}


                    {/* Typing indicator */}

                    {isOtherUserTyping &&
                        selectedUser && (

                            <div className="typing-indicator">

                                {selectedUser.username}
                                {" is typing..."}

                            </div>

                        )}


                    {/* Auto-scroll */}

                    <div
                        ref={messagesEndRef}
                    ></div>

                </div>


                {/* Message Input */}

                <div className="message-input">

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={handleTyping}
                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter"
                            ) {

                                handleSendMessage();

                            }

                        }}
                    />


                    <button
                        onClick={
                            handleSendMessage
                        }
                    >
                        Send
                    </button>

                </div>

            </div>

        </div>

    );

}

export default ChatDashboard;