import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatDashboard from "./pages/ChatDashboard";
import Settings from "./pages/Settings";

import "./App.css";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* LOGIN */}

                <Route
                    path="/"
                    element={
                        <Login />
                    }
                />


                {/* REGISTER */}

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                {/* CHAT */}

                <Route
                    path="/chat"
                    element={
                        <ChatDashboard />
                    }
                />


                {/* SETTINGS */}

                <Route
                    path="/settings"
                    element={
                        <Settings />
                    }
                />


                {/* UNKNOWN ROUTE */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;