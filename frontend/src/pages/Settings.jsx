import { useNavigate } from "react-router-dom";


function Settings() {

    const navigate = useNavigate();


    return (

        <div className="settings-page">

            <div className="settings-container">

                <div className="settings-header">

                    <button
                        className="settings-back"
                        onClick={() =>
                            navigate("/chat")
                        }
                    >
                        ← Back to Chat
                    </button>


                    <h1>
                        ⚙️ Settings
                    </h1>


                    <p>
                        Manage your account and preferences
                    </p>

                </div>


                {/* =========================
                    ACCOUNT
                ========================= */}

                <div className="settings-section">

                    <h3>
                        ACCOUNT
                    </h3>


                    <button
                        className="settings-item"
                    >

                        <span>
                            👤
                        </span>


                        <div>

                            <strong>
                                My Account
                            </strong>

                            <p>
                                View your account information
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>


                    <button
                        className="settings-item"
                    >

                        <span>
                            ✏️
                        </span>


                        <div>

                            <strong>
                                Edit Profile
                            </strong>

                            <p>
                                Change your profile information
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>

                </div>


                {/* =========================
                    PREFERENCES
                ========================= */}

                <div className="settings-section">

                    <h3>
                        PREFERENCES
                    </h3>


                    <button
                        className="settings-item"
                    >

                        <span>
                            🌙
                        </span>


                        <div>

                            <strong>
                                Appearance
                            </strong>

                            <p>
                                Customize the look of the app
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>


                    <button
                        className="settings-item"
                    >

                        <span>
                            🔔
                        </span>


                        <div>

                            <strong>
                                Notifications
                            </strong>

                            <p>
                                Manage notification preferences
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>

                </div>


                {/* =========================
                    PRIVACY & SECURITY
                ========================= */}

                <div className="settings-section">

                    <h3>
                        PRIVACY & SECURITY
                    </h3>


                    <button
                        className="settings-item"
                    >

                        <span>
                            🔒
                        </span>


                        <div>

                            <strong>
                                Privacy
                            </strong>

                            <p>
                                Manage your privacy settings
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>


                    <button
                        className="settings-item"
                    >

                        <span>
                            🛡️
                        </span>


                        <div>

                            <strong>
                                Security
                            </strong>

                            <p>
                                Manage your account security
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>

                </div>


                {/* =========================
                    INFORMATION
                ========================= */}

                <div className="settings-section">

                    <h3>
                        INFORMATION
                    </h3>


                    <button
                        className="settings-item"
                    >

                        <span>
                            📜
                        </span>


                        <div>

                            <strong>
                                Privacy Policy
                            </strong>

                            <p>
                                Read our privacy policy
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>


                    <button
                        className="settings-item"
                    >

                        <span>
                            📋
                        </span>


                        <div>

                            <strong>
                                Terms & Conditions
                            </strong>

                            <p>
                                Read our terms and conditions
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>


                    <button
                        className="settings-item"
                    >

                        <span>
                            ℹ️
                        </span>


                        <div>

                            <strong>
                                About
                            </strong>

                            <p>
                                About this chat application
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>

                </div>


                {/* =========================
                    ACCOUNT ACTIONS
                ========================= */}

                <div className="settings-section danger-section">

                    <h3>
                        ACCOUNT ACTIONS
                    </h3>


                    <button
                        className="settings-item logout-item"
                    >

                        <span>
                            🚪
                        </span>


                        <div>

                            <strong>
                                Logout
                            </strong>

                            <p>
                                Sign out of your account
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>


                    <button
                        className="settings-item delete-item"
                    >

                        <span>
                            🗑️
                        </span>


                        <div>

                            <strong>
                                Delete Account
                            </strong>

                            <p>
                                Permanently delete your account
                            </p>

                        </div>


                        <span className="settings-arrow">
                            ›
                        </span>

                    </button>

                </div>

            </div>

        </div>

    );

}


export default Settings;