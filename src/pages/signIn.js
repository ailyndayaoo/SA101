import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import '../css/signIn.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import pic1 from '../pictures/pic1.jpg'; 
import pic3 from '../pictures/pic2.png';


const SignIn = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const location = useLocation(); 

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSignIn = (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('Please input credentials');
        } else if (username === 'admin' && password === 'password') {
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
            <div className="logo-signin-container">
                <img src={pic3} alt="Logo" className="logo-signin" />
                </div>
                <div className="form-header">
                <p>ADMIN ACCOUNT</p>
                </div>
                <h1>Welcome Back!</h1>
                <p>Please Sign In</p>
                <form onSubmit={handleSignIn}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text-username"
                        id="username"
                        name="username"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                        className="enter-username"
                    />

                    <label htmlFor="password">Password</label>
                    <div className="password-field">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button
                            type="button"
                            className="toggle-button"
                            onClick={togglePasswordVisibility}
                        >
                            {passwordVisible ? (
                                <i className="fas fa-eye-slash"></i>
                            ) : (
                                <i className="fas fa-eye"></i> 
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
