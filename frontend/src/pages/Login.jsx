import './css/Login.css';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        '/choreo-apis/sandbook-social-media/backend/v1/login',
        new URLSearchParams({
          username: formData.email,
          password: formData.password
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Save token to localStorage
      localStorage.setItem('token', response.data.access_token);

      // Redirect to home page
      navigate('/home');
    } catch (err) {
      setError('Invalid email or password');
    }
  }

  return (
    <>
      <div className="background-container"></div>
      <div className="login-wrapper">
        <h2 className="login-title">Login to Sandbook</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit">Login</button>
        </form>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <div className="new-user">
          <p>If you are new to here?..</p>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </>
  );
}
