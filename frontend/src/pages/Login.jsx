import { useState } from "react";

function Login({ setIsLoggedIn }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    
    const handleLogin = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

           const data = await response.json();

        console.log(data);

        if (!response.ok) {
            alert(data.error || data.message || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);

        alert("Login successful!");

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>
                Login
            </button>
        </div>
    );
}

export default Login;