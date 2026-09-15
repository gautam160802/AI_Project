import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth';

const Register = () => {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {loading, handleRegister} = useAuth();

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await handleRegister({ username, email, password });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  if(loading) {
    return (<main className="auth-page"><p className="page-loading">Loading...</p></main>)
  }
  return (
    <main className="auth-page">
    <div className="form-container">
        <h1>Create account</h1>
        <p>Start building your personal knowledge vault.</p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
        <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                onChange={(e) => {setUsername(e.target.value)}}
                type="text" id="username" placeholder='Enter username' />
            </div>

            <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                onChange={(e) => {setEmail(e.target.value)}}
                type="email" id="email" placeholder='Enter email address' />
            </div>
            <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                onChange={(e) => {setPassword(e.target.value)}}
                type="password" id="password" placeholder='Enter password' />
            </div>
            <button className='button primary-button'>Register</button>
        </form>

        <p>Already have an account? <Link to={"/login"}>Login</Link></p>
    </div>
</main>
  )
}

export default Register