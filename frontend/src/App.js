import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTask from './pages/CreateTask';
import CreateGroup from './pages/CreateGroup';
import InviteToGroup from './pages/InviteToGroup';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login setUser={setUser} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="main-wrapper">
        <h1>Team Tasker</h1>
        <p className="app-subtitle">The collaborative task manager!</p>
        <Routes>
          <Route path="/" element={<Dashboard user={user} setUser={setUser} />} />
          <Route path="/invite" element={<InviteToGroup user={user} />} />
          <Route path="/create-task" element={<CreateTask user={user} onTaskCreated={() => window.location.href = '/'} />} />
          <Route path="/create-group" element={<CreateGroup user={user} onGroupCreated={() => window.location.href = '/'} />} />
          <Route path="/invite/:groupId" element={<InviteToGroup user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
