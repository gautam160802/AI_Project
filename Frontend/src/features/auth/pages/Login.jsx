import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import ThemeToggle from '../../theme/ThemeToggle'

const Login = () => {
    
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await handleLogin({ email, password });
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (<main className="auth-page"><p className="page-loading">Loading...</p></main>)
    }
  return (
    <main className="auth-page">
        <ThemeToggle className="theme-toggle--floating" />
        <div className="form-container">
            <h1>Welcome back</h1>
            <p>Sign in to your MindVault workspace.</p>

            {error && <p className="form-error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                    onChange={(e) => { setEmail(e.target.value)}}
                    type="email" id="email" placeholder='Enter email address' />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input 
                    onChange={ (e) => { setPassword(e.target.value)}}
                    type="password" id="password" placeholder='Enter password' />
                </div>
                <button className='button primary-button'>Login</button>
            </form>

            <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
        </div>
    </main>
  )
}

export default Login
