import { useState } from 'react';
import './css/SignUp.css';
import { Link, useNavigate } from "react-router-dom"
import axios from 'axios'

export default function SignUp() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name:'',
    email:'',
    password:'',
    confirmPassword:'',

  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{}|;:,.<>])[A-Za-z\d@$!%*?&#^()_+\-=[\]{}|;:,.<>]{8,}$/;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      setError('Password not strong include  (@$!%*?&)');
      return;
    }

    setLoading(true);

     try {
      const response = await axios.post('http://localhost:8000/createUser', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log('User registered successfully:', response.data);
      navigate('/');

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        setError(error.response.data.message || 'Registration failed. Please try again.');

      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');

      } else {
        setError('An unexpected error occurred. Please try again.');
      }

    } finally {
      setLoading(false);
    }

  }


  return (
        <>
        <div className="background-container"></div>
          <div className="register-wrapper">
            <h2 className="register-title">Register to Sandbook</h2>
            <form className="register-form" onSubmit={handleSubmit}>

              {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

              <label htmlFor="name">User Name</label>
              <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />

              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}/>
      
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required value={formData.password} onChange={handleChange}/>

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}/>
      
              <button type="submit" disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>
            </form>
      
            <div className="log-user">
              <p>Already have an account ?.. </p>
              <Link to="/">Login</Link>
            </div>
    
        </div>
        </>
  )
}
