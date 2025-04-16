import React, { useState } from 'react';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login'); 
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const endpoint = mode === 'login' ? 'login' : 'register';
    const payload = mode === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Something went wrong');

      setUser(data.user); 
    } catch (err) {
      setError(err.message); 
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">{mode === 'login' ? 'Login' : 'Register'}</h2>

      {mode === 'register' && (
        <input
          className="auth-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      )}
      <br />

      <input
        className="auth-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <br />

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleSubmit} className="auth-button">
        {mode === 'login' ? 'Login' : 'Register'}
      </button>

      <p>
        {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="auth-button">
          {mode === 'login' ? 'Register here' : 'Login here'}
        </button>
      </p>

      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
