import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import {
    useState
} from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatDashboard from "./pages/ChatDashboard";
import Settings from "./pages/Settings";

import "./App.css";


function App() {

    const [
        isLoggedIn,
        setIsLoggedIn
    ] = useState(
        !!localStorage.getItem("token")
    );


    return (

        <BrowserRouter>

            <Routes>

                {/* =========================
                    LOGIN
                ========================= */}

                <Route
                    path="/"
                    element={
                        isLoggedIn ? (

                            <Navigate
                                to="/chat"
                                replace
                            />

                        ) : (

                            <Login
                                setIsLoggedIn={
                                    setIsLoggedIn
                                }
                            />

                        )
                    }
                />


                {/* =========================
                    REGISTER
                ========================= */}

                <Route
                    path="/register"
                    element={
                        isLoggedIn ? (

                            <Navigate
                                to="/chat"
                                replace
                            />

                        ) : (

                            <Register />

                        )
                    }
                />


                {/* =========================
                    CHAT
                ========================= */}

                <Route
                    path="/chat"
                    element={
                        isLoggedIn ? (

                            <ChatDashboard
                                setIsLoggedIn={
                                    setIsLoggedIn
                                }
                            />

                        ) : (

                            <Navigate
                                to="/"
                                replace
                            />

                        )
                    }
                />


                {/* =========================
                    SETTINGS
                ========================= */}

                <Route
                    path="/settings"
                    element={
                        isLoggedIn ? (

                            <Settings />

                        ) : (

                            <Navigate
                                to="/"
                                replace
                            />

                        )
                    }
                />


                {/* =========================
                    UNKNOWN ROUTE
                ========================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                isLoggedIn
                                    ? "/chat"
                                    : "/"
                            }
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;