import React, { useState } from 'react';

export default function CreateGroup({ user, onGroupCreated }) {
  console.log('Creating group with:', user._id);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, ownerId: user._id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to create group');

      onGroupCreated();
      setGroupName('');
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <h3 className="form-title">Create Group</h3>
      <input
        className="form-input"
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        placeholder="Group Name"
      />
      <button className="form-button" onClick={handleCreate}>Create</button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
