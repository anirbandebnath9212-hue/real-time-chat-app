import { useState } from "react";

function Login({ setIsLoggedIn }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleLogin = async () => {

        try {

            const response = await fetch(
                "https://real-time-chat-app-hgdr.onrender.com/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data =
                await response.json();


            console.log(data);


            if (!response.ok) {

                alert(
                    data.error ||
                    data.message ||
                    "Login failed"
                );

                return;

            }


            localStorage.setItem(
                "token",
                data.token
            );


            setIsLoggedIn(true);


            alert(
                "Login successful!"
            );


        } catch (error) {

            console.log(error);

            alert(
                "Cannot connect to backend"
            );

        }

    };


    return (

        <div className="auth-container">

            <div className="auth-card">

                <h1>
                    Welcome Back
                </h1>

                <p className="auth-subtitle">
                    Login to continue chatting
                </p>


                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />


                <button
                    className="auth-button"
                    onClick={handleLogin}
                >
                    Login
                </button>

            </div>

        </div>

    );

}

export default Login;