import { useEffect, useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatDashboard from "./pages/ChatDashboard";

function App() {

    const [showLogin, setShowLogin] = useState(true);

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );


    // Check token when app starts
    useEffect(() => {

        const token =
            localStorage.getItem("token");

        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

    }, []);


    // Show dashboard if logged in
    if (isLoggedIn) {
        return (
            <ChatDashboard
                setIsLoggedIn={setIsLoggedIn}
            />
        );
    }


    // Show login/register
    return (
        <div>

            {showLogin ? (

                <Login
                    setIsLoggedIn={setIsLoggedIn}
                />

            ) : (

                <Register />

            )}


            <button
                onClick={() =>
                    setShowLogin(!showLogin)
                }
            >

                {showLogin
                    ? "Create an account"
                    : "Already have an account?"}

            </button>

        </div>
    );
}

export default App;