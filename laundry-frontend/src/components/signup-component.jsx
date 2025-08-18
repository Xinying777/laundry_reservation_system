// src/components/signup-component.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    const { student_id, name, email, phone, password, confirmPassword } = form;
    if (!student_id || !name || !email || !password || !confirmPassword) {
      setErr('Student ID, Name, Email and both Password fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setErr('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/register', { student_id, password, name, email, phone });
      alert('Account created! Please log in.');
      navigate('/login');
    } catch (e2) {
      setErr(e2.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top banner and styles using App.css */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Student Registration</h1>
          <p className="hero-subtitle">Create your campus laundry account</p>
        </div>
      </div>

      <div className="login-container">
        <h2>Sign Up</h2>
        {err && <p className="error-text">{err}</p>}

        <form onSubmit={onSubmit}>
          <label htmlFor="student_id">Student ID *</label>
          <input id="student_id" name="student_id" value={form.student_id} onChange={onChange} required disabled={loading} />

          <label htmlFor="name">Full Name *</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required disabled={loading} />

          <label htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required disabled={loading} />

          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={onChange} disabled={loading} />

          <label htmlFor="password">Password *</label>
          <input id="password" name="password" type="password" value={form.password} onChange={onChange} required disabled={loading} />

          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} required disabled={loading} />

          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
