import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useLocation to the import
import '../css/signIn.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import pic1 from '../pictures/pic1.jpg'; // Import the image

const SignIn = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const location = useLocation(); // Use useLocation to access the passed state

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSignIn = (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('Please input credentials');
        } else if (username === 'admin' && password === 'password') {
            // Store the selected branch in localStorage
            const selectedBranch = location.state?.selectedBranch;
            localStorage.setItem('selectedBranch', selectedBranch);
            navigate('/home/staff');
        } else {
            alert('Invalid credentials');
        }
    };


    return (
        <div className="sign-in-container">
            <div className="signIn-form-container">
                <div className="form-header">
                    <h2>Chic Station</h2>
                    <p>ADMIN ACCOUNT</p>
                </div>
                <h1>Welcome Back!</h1>
                <p>Please Sign In</p>
                <form onSubmit={handleSignIn}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Update username state
                    />

                    <label htmlFor="password">Password</label>
                    <div className="password-field">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} // Update password state
                        />
                        <button
                            type="button"
                            className="toggle-button"
                            onClick={togglePasswordVisibility}
                        >
                            {passwordVisible ? (
                                <i className="fas fa-eye-slash"></i> // Font Awesome eye-slash icon
                            ) : (
                                <i className="fas fa-eye"></i> // Font Awesome eye icon
                            )}
                        </button>
                    </div>

                    <div className="remember-me">
                        <input type="checkbox" id="remember-me" name="remember-me" />
                        <label htmlFor="remember-me">Remember me</label>
                    </div>

                    <button type="submit" className="sign-in-button">Sign In</button>
                </form>
            </div>

            <div className="image-container">
                <img src={pic1} alt="Chic Station" />
            </div>
        </div>
    );
};

export default SignIn;
