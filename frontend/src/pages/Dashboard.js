import React, { useEffect, useState } from 'react';
import CreateTask from './CreateTask';
import CreateGroup from './CreateGroup';
import TaskList from '../components/TaskList';
import { Link } from 'react-router-dom';

export default function Dashboard({ user, setUser }) {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);

  const fetchTasks = async () => {
    const res = await fetch(`http://localhost:5000/api/tasks/${user._id}`);
    const data = await res.json();
    setTasks(data);
  };

  const fetchGroups = async () => {
    const res = await fetch(`http://localhost:5000/api/groups/user/${user._id}`);
    const data = await res.json();
    setGroups(data);
  };

  const completeTask = async (taskId) => {
    await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
      method: 'PATCH'
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
    fetchGroups();
  }, []);

  const leaveGroup = async (groupId) => {
    const confirm = window.confirm('Are you sure you want to leave this group?');
    if (!confirm) return;
  
    await fetch('http://localhost:5000/api/groups/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, userId: user._id })
    });
  
    fetchGroups();
  };

  const deleteTask = async (taskId) => {
    await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: 'DELETE'
    });
    fetchTasks();
  };

  const removeMember = async (groupId, memberId) => {
    const confirm = window.confirm('Remove this member from the group?');
    if (!confirm) return;
  
    await fetch(`http://localhost:5000/api/groups/${groupId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: memberId, requesterId: user._id })
    });
  
    fetchGroups();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Welcome, {user.name}</h2>
        <button className="logout-button" onClick={() => setUser(null)}>Logout</button>
      </div>

      {/* Create Task Section */}
      <CreateTask user={user} onTaskCreated={fetchTasks} />
      <hr className="section-divider"/>

      {/* Create Group Section */}
      <CreateGroup user={user} onGroupCreated={fetchGroups} />
      <hr className="section-divider"/>

      {/* Task List */}
      <TaskList tasks={tasks} onComplete={completeTask} onDelete={deleteTask} />
      <hr className="section-divider"/>

      {/* Group List with Invite Button */}
      <h3>Your Groups</h3>
      <ul className="group-list">
        {groups.map((group) => (
          <li key={group._id} className="group-item">
            <h4>{group.name}</h4>
            <p>Members: {group.members.length}</p>

            {/* List members with remove buttons */}
            <ul className="member-list">
              {group.members.map((member) => (
                <li key={member._id} className="member-item">
                  {member.name} ({member.email})
                  {group.owner === user._id && member._id !== user._id && (
                    <button
                      className="remove-button action-button"
                      onClick={() => removeMember(group._id, member._id)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {/* Invite & Leave Buttons */}
            <div className="group-actions">
              <Link to={`/invite/${group._id}`}>
                <button className="invite-button">Invite Member</button>
              </Link>
              <button
                className="leave-button"
                onClick={() => leaveGroup(group._id)}
              >
                Leave Group
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
