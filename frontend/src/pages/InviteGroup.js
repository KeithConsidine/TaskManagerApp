import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function InviteToGroup({ user }) {
  const { groupId: paramGroupId } = useParams(); 
  const [groupId, setGroupId] = useState(paramGroupId || '');
  const [emailToInvite, setEmailToInvite] = useState('');
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch(`http://localhost:5000/api/groups/user/${user._id}`);
      const data = await res.json();
      setGroups(data);
    };

    fetchGroups();
  }, [user]);

  const handleInvite = async () => {
    try {
      if (!groupId || !emailToInvite) {
        setMessage('Please select a group and enter an email');
        return;
      }
  
      setMessage('Processing...');
  
      const res = await fetch(`http://localhost:5000/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: emailToInvite.trim() }),
      });
  
      const data = await res.json();
      console.log('Invite response:', data);
  
      if (!res.ok) throw new Error(data.msg || 'Invite failed');
  
      setMessage(data.msg || 'Invite successful!');
      setEmailToInvite('');
    } catch (err) {
      console.error('Invite failed:', err);
      setMessage(err.message || 'Failed to send invite');
    }
  };

  return (
    <div className="invite-container">
      <h2 className="invite-title">Invite User to Group</h2>

      <label>Select Group:</label>
      <select onChange={(e) => setGroupId(e.target.value)} value={groupId}>
        <option value="">-- Select --</option>
        {groups.map((g) => (
          <option key={g._id} value={g._id}>
            {g.name}
          </option>
        ))}
      </select>
      <br />

      <label>Email to invite:</label>
      <input
        className="form-input"
        type="email"
        placeholder="Enter user email"
        value={emailToInvite}
        onChange={(e) => setEmailToInvite(e.target.value)}
      />
      <br />

      <button className="form-button" onClick={handleInvite}>Invite</button>

      {message && <p>{message}</p>}

      <button
        onClick={() => navigate('/')}
        className="back-button"
      >
        Back to Dashboard
    </button>
    </div>
  );
}
