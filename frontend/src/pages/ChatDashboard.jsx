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

    // Search
    const [searchText, setSearchText] = useState("");

    // Edit profile
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newUsername, setNewUsername] = useState("");

    // Typing
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Auto scroll
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
    // =========================

    useEffect(() => {

        const handleNewMessage = (message) => {

            console.log(
                "New message received:",
                message
            );


            setConversations(
                (previousConversations) => {

                    return previousConversations.map(
                        (conversation) => {

                            if (
                                conversation._id.toString() ===
                                message.conversationId.toString()
                            ) {

                                const senderId =
                                    message.sender?._id ||
                                    message.sender;


                                const isMyMessage =
                                    currentUser &&
                                    senderId.toString() ===
                                    currentUser._id.toString();


                                return {

                                    ...conversation,

                                    lastMessage:
                                        message,

                                    unreadCount:
                                        isMyMessage
                                            ? conversation.unreadCount
                                            : conversation.unreadCount + 1

                                };

                            }


                            return conversation;

                        }
                    );

                }
            );


            if (
                !selectedConversation ||
                message.conversationId.toString() !==
                selectedConversation._id.toString()
            ) {

                return;

            }


            setMessages(
                (previousMessages) => {

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

                }
            );

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

    }, [
        selectedConversation,
        currentUser
    ]);


    // =========================
    // MESSAGE DELETED
    // =========================

    useEffect(() => {

        const handleMessageDeleted = (data) => {

            console.log(
                "Message deleted:",
                data
            );


            // Remove message from chat

            setMessages(
                (previousMessages) => {

                    return previousMessages.filter(
                        (message) =>
                            message._id !==
                            data.messageId
                    );

                }
            );


            // Update sidebar preview

            setConversations(
                (previousConversations) => {

                    return previousConversations.map(
                        (conversation) => {

                            if (
                                conversation._id.toString() !==
                                data.conversationId.toString()
                            ) {

                                return conversation;

                            }


                            // If deleted message
                            // was the latest message

                            if (
                                conversation.lastMessage?._id ===
                                data.messageId
                            ) {

                                return {

                                    ...conversation,

                                    lastMessage: null

                                };

                            }


                            return conversation;

                        }
                    );

                }
            );

        };


        socket.on(
            "messageDeleted",
            handleMessageDeleted
        );


        return () => {

            socket.off(
                "messageDeleted",
                handleMessageDeleted
            );

        };

    }, []);


    // =========================
    // MESSAGES READ
    // =========================

    useEffect(() => {

        const handleMessagesRead = (data) => {

            console.log(
                "Messages read:",
                data
            );


            if (
                selectedConversation &&
                data.conversationId.toString() ===
                selectedConversation._id.toString()
            ) {

                setMessages(
                    (previousMessages) => {

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

                    }
                );

            }


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

            setIsOtherUserTyping(true);

        };


        const handleUserStoppedTyping = () => {

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


                if (!response.ok) {

                    localStorage.removeItem(
                        "token"
                    );

                    setIsLoggedIn(false);

                    return;

                }


                setCurrentUser(
                    data.user
                );


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


                if (!response.ok) {

                    return;

                }


                setUsers(
                    data.users
                );


            } catch (error) {

                console.log(error);

            }

        };


        fetchUsers();

    }, []);


    // =========================
    // GET CONVERSATIONS
    // =========================

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


    // =========================
    // OPEN CONVERSATION
    // =========================

    const handleUserClick = async (user) => {

        try {

            const token =
                localStorage.getItem("token");


            setSelectedUser(
                user
            );


            setIsOtherUserTyping(
                false
            );


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

                        userId:
                            user._id

                    })

                }
            );


            const data =
                await response.json();


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


            if (!messageResponse.ok) {

                return;

            }


            setMessages(
                messageData.messages
            );


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


            setConversations(
                (previousConversations) => {

                    return previousConversations.map(
                        (item) => {

                            if (
                                item._id ===
                                conversation._id
                            ) {

                                return {

                                    ...item,

                                    unreadCount: 0

                                };

                            }


                            return item;

                        }
                    );

                }
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


        setMessageText(
            value
        );


        if (!selectedConversation) {

            return;

        }


        if (typingTimeoutRef.current) {

            clearTimeout(
                typingTimeoutRef.current
            );

        }


        if (!value.trim()) {

            socket.emit(
                "stopTyping",
                selectedConversation._id
            );

            return;

        }


        socket.emit(
            "typing",
            selectedConversation._id
        );


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


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to send message"
                );

                return;

            }


            setMessages(
                (previousMessages) => {

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

                }
            );


            setMessageText("");


        } catch (error) {

            console.log(error);

        }

    };


    // =========================
    // DELETE MESSAGE
    // =========================

    const handleDeleteMessage = async (messageId) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this message?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `https://real-time-chat-app-hgdr.onrender.com/api/messages/${messageId}`,
                {
                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


            const data =
                await response.json();


            console.log(
                "Delete response:",
                data
            );


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to delete message"
                );

                return;

            }


            // Remove immediately

            setMessages(
                (previousMessages) => {

                    return previousMessages.filter(
                        (message) =>
                            message._id !==
                            messageId
                    );

                }
            );


            // Update sidebar

            setConversations(
                (previousConversations) => {

                    return previousConversations.map(
                        (conversation) => {

                            if (
                                conversation.lastMessage?._id ===
                                messageId
                            ) {

                                return {

                                    ...conversation,

                                    lastMessage: null

                                };

                            }


                            return conversation;

                        }
                    );

                }
            );


        } catch (error) {

            console.log(error);

            alert(
                "Cannot connect to server"
            );

        }

    };


    // =========================
    // START EDIT PROFILE
    // =========================

    const handleEditProfile = () => {

        setNewUsername(
            currentUser?.username || ""
        );

        setIsEditingProfile(
            true
        );

    };


    // =========================
    // CANCEL EDIT
    // =========================

    const handleCancelEdit = () => {

        setNewUsername("");

        setIsEditingProfile(
            false
        );

    };


    // =========================
    // UPDATE PROFILE
    // =========================

    const handleUpdateProfile = async () => {

        if (!newUsername.trim()) {

            alert(
                "Username cannot be empty"
            );

            return;

        }


        try {

            const token =
                localStorage.getItem("token");


            const response = await fetch(
                "https://real-time-chat-app-hgdr.onrender.com/api/users/profile",
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        username:
                            newUsername

                    })

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to update profile"
                );

                return;

            }


            setCurrentUser(
                (previousUser) => ({

                    ...previousUser,

                    username:
                        data.user.username

                })
            );


            setUsers(
                (previousUsers) => {

                    return previousUsers.map(
                        (user) => {

                            if (
                                user._id ===
                                data.user.id
                            ) {

                                return {

                                    ...user,

                                    username:
                                        data.user.username

                                };

                            }


                            return user;

                        }
                    );

                }
            );


            setNewUsername("");

            setIsEditingProfile(
                false
            );


            alert(
                "Profile updated successfully!"
            );


        } catch (error) {

            console.log(error);

            alert(
                "Cannot connect to server"
            );

        }

    };


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        setIsLoggedIn(
            false
        );

    };


    // =========================
    // FILTER USERS
    // =========================

    const filteredUsers =
        users.filter((user) => {

            if (
                user._id ===
                currentUser?._id
            ) {

                return false;

            }


            return user.username
                .toLowerCase()
                .includes(
                    searchText
                        .toLowerCase()
                        .trim()
                );

        });


    // =========================
    // RETURN
    // =========================

    return (

        <div className="chat-dashboard">


            {/* =========================
                SIDEBAR
            ========================= */}

            <div className="sidebar">


                {/* PROFILE */}

                {currentUser && (

                    <div className="profile-card">

                        <div className="profile-avatar">

                            {currentUser.username
                                ?.charAt(0)
                                .toUpperCase()}

                        </div>


                        {!isEditingProfile ? (

                            <div className="profile-info">

                                <h3>
                                    {
                                        currentUser.username
                                    }
                                </h3>


                                <p>
                                    {
                                        currentUser.email
                                    }
                                </p>


                                <span className="profile-online">

                                    <span className="status-dot">
                                        ●
                                    </span>

                                    Online

                                </span>


                                <button
                                    className="edit-profile-button"
                                    onClick={
                                        handleEditProfile
                                    }
                                >
                                    Edit Profile
                                </button>

                            </div>

                        ) : (

                            <div className="profile-edit">

                                <input
                                    type="text"
                                    value={
                                        newUsername
                                    }
                                    onChange={(e) =>
                                        setNewUsername(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter username"
                                />


                                <div className="profile-edit-buttons">

                                    <button
                                        className="save-profile-button"
                                        onClick={
                                            handleUpdateProfile
                                        }
                                    >
                                        Save
                                    </button>


                                    <button
                                        className="cancel-profile-button"
                                        onClick={
                                            handleCancelEdit
                                        }
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                )}


                {/* SIDEBAR TITLE */}

                <div className="sidebar-title">

                    <h2>
                        Chats
                    </h2>

                </div>


                {/* SEARCH */}

                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={
                            searchText
                        }
                        onChange={(e) =>
                            setSearchText(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* LOGOUT */}

                <button
                    onClick={
                        handleLogout
                    }
                >
                    Logout
                </button>


                {/* USERS */}

                {filteredUsers.length > 0 ? (

                    filteredUsers.map((user) => {

                        const conversation =
                            conversations.find(
                                (conversation) =>
                                    conversation.participants.some(
                                        (participant) =>
                                            participant._id ===
                                            user._id
                                    )
                            );


                        return (

                            <div
                                className={
                                    selectedUser?._id ===
                                    user._id
                                        ? "chat-user active"
                                        : "chat-user"
                                }

                                key={
                                    user._id
                                }

                                onClick={() =>
                                    handleUserClick(
                                        user
                                    )
                                }
                            >

                                <div className="user-avatar">

                                    {user.username
                                        ?.charAt(0)
                                        .toUpperCase()}

                                </div>


                                <div className="user-info">

                                    <div className="user-name-row">

                                        <h3>
                                            {
                                                user.username
                                            }
                                        </h3>


                                        {conversation?.unreadCount >
                                            0 && (

                                            <span className="unread-count">

                                                {
                                                    conversation.unreadCount
                                                }

                                            </span>

                                        )}

                                    </div>


                                    <p>

                                        {
                                            conversation
                                                ?.lastMessage
                                                ?.text ||
                                            "No messages yet"
                                        }

                                    </p>


                                    <span
                                        className={
                                            user.isOnline
                                                ? "online-status"
                                                : "offline-status"
                                        }
                                    >

                                        <span className="status-dot">
                                            ●
                                        </span>

                                        {user.isOnline
                                            ? "Online"
                                            : "Offline"}

                                    </span>

                                </div>

                            </div>

                        );

                    })

                ) : (

                    <div className="no-users">

                        <p>
                            No users found
                        </p>

                    </div>

                )}

            </div>


            {/* =========================
                CHAT WINDOW
            ========================= */}

            <div className="chat-window">


                {/* HEADER */}

                <div className="chat-header">

                    {selectedUser ? (

                        <>

                            <div className="header-avatar">

                                {selectedUser.username
                                    ?.charAt(0)
                                    .toUpperCase()}

                            </div>


                            <div className="header-user-info">

                                <h2>
                                    {
                                        selectedUser.username
                                    }
                                </h2>


                                <span
                                    className={
                                        selectedUser.isOnline
                                            ? "online-status"
                                            : "offline-status"
                                    }
                                >

                                    <span className="status-dot">
                                        ●
                                    </span>

                                    {selectedUser.isOnline
                                        ? "Online"
                                        : "Offline"}

                                </span>

                            </div>

                        </>

                    ) : (

                        <div className="empty-header">

                            <h2>
                                Select a chat
                            </h2>

                            <p>
                                Choose a user to start chatting
                            </p>

                        </div>

                    )}

                </div>


                {/* =========================
                    MESSAGES
                ========================= */}

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

                                                    {
                                                        formatMessageTime(
                                                            message.createdAt
                                                        )
                                                    }


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


                                                {/* DELETE */}

                                                {isMyMessage && (

                                                    <button
                                                        className="delete-message-button"
                                                        onClick={() =>
                                                            handleDeleteMessage(
                                                                message._id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                )}

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

                        <div className="empty-chat">

                            <h3>
                                Welcome to Chat
                            </h3>

                            <p>
                                Select a user from the sidebar to start a conversation.
                            </p>

                        </div>

                    )}


                    {/* TYPING */}

                    {isOtherUserTyping &&
                        selectedUser && (

                            <div className="typing-indicator">

                                {selectedUser.username}
                                {" is typing..."}

                            </div>

                        )}


                    <div
                        ref={
                            messagesEndRef
                        }
                    ></div>

                </div>


                {/* MESSAGE INPUT */}

                <div className="message-input">

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={
                            messageText
                        }
                        onChange={
                            handleTyping
                        }
                        onKeyDown={(e) => {

                            if (
                                e.key ===
                                "Enter"
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