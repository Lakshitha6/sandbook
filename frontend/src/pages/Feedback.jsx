import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './css/Feedback.css';

export default function Feedback() {
  const [formData, setFormData] = useState({
    email: '',
    message: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState({});


  const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_et2';
  const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'temlate_5uws';
  const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'W_tyjP8X6bJ';

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(PUBLIC_KEY);
  }, [PUBLIC_KEY]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_name: 'Support Team',
        }
      );

      console.log('EmailJS Result:', result);

      if (result.status === 200) {
        setSubmitStatus('success');
        setFormData({ email: '', message: '', name: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-container">

      <div className="feedback-header">
        <div className="feedback-header-content">
          <h1 className="feedback-title">We'd Love Your Feedback</h1>
          <p className="feedback-subtitle">
            Help us improve by sharing your thoughts, suggestions, or reporting any issues you've encountered.
          </p>
        </div>
      </div>

      <div className="feedback-form-wrapper">
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-form-group">
            <label htmlFor="feedback-name" className="feedback-label">
              Full Name *
            </label>
            <input
              type="text"
              id="feedback-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`feedback-input ${errors.name ? 'feedback-input-error' : ''}`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className="feedback-error-text">{errors.name}</span>
            )}
          </div>

          <div className="feedback-form-group">
            <label htmlFor="feedback-email" className="feedback-label">
              Email Address *
            </label>
            <input
              type="email"
              id="feedback-email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`feedback-input ${errors.email ? 'feedback-input-error' : ''}`}
              placeholder="Enter your email address"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="feedback-error-text">{errors.email}</span>
            )}
          </div>

          <div className="feedback-form-group">
            <label htmlFor="feedback-message" className="feedback-label">
              Your Message *
            </label>
            <textarea
              id="feedback-message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={`feedback-textarea ${errors.message ? 'feedback-input-error' : ''}`}
              placeholder="Tell us about your experience, suggestions, or any issues you've encountered..."
              rows="6"
              disabled={isSubmitting}
            />
            {errors.message && (
              <span className="feedback-error-text">{errors.message}</span>
            )}
            <div className="feedback-char-count">
              {formData.message.length}/500 characters
            </div>
          </div>

          <button
            type="submit"
            className={`feedback-submit-btn ${isSubmitting ? 'feedback-submit-btn-loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="feedback-submit-spinner"></div>
                Sending...
              </>
            ) : (
              <>
                <span className="feedback-submit-icon">✉️</span>
                Send Feedback
              </>
            )}
          </button>

          {submitStatus === 'success' && (
            <div className="feedback-success-message">
              <div className="feedback-success-icon">✅</div>
              <h3>Thank you for your feedback!</h3>
              <p>We've received your message and will get back to you soon.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="feedback-error-message">
              <div className="feedback-error-icon">❌</div>
              <h3>Something went wrong</h3>
              <p>Please try again later or contact us directly.</p>
            </div>
          )}
        </form>
      </div>

      <div className="feedback-footer">
        <div className="feedback-contact-info">
          <h3>Other Ways to Reach Us</h3>
          <div className="feedback-contact-methods">
            <div className="feedback-contact-item">
              <span className="feedback-contact-icon">📧</span>
              <span>support@yourapp.com</span>
            </div>
            <div className="feedback-contact-item">
              <span className="feedback-contact-icon">🐦</span>
              <span>@yourapp on Twitter</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
