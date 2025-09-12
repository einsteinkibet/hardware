// src/components/Auth/Register.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userData.password !== userData.password2) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      await authAPI.register(userData);
      toast.success('Registration successful! Please login.');
      // Redirect to login or auto-login
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg" style={{ width: '450px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="fas fa-hard-hat fa-3x text-primary mb-3"></i>
            <h2 className="card-title">Create Account</h2>
            <p className="text-muted">Join HardwarePro Manager</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.first_name}
                    onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.last_name}
                    onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={userData.password2}
                onChange={(e) => setUserData({ ...userData, password2: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;