import { useState } from "react";

function Register() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const response = await fetch(
                "https://real-time-chat-app-hgdr.onrender.com/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            console.log(data);

            if (!response.ok) {
                alert(data.error || data.message || "Registration failed");
                return;
            }

            alert("Registration successful!");

        } catch (error) {
            console.log(error);
            alert("Cannot connect to backend");
        }
    };

    return (
        <div>
            <h1>Register</h1>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

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

            <button onClick={handleRegister}>
                Register
            </button>
        </div>
    );
}

export default Register;