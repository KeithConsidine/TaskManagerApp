import React, { useState, useEffect } from 'react';
import '../App.css';

export default function CreateTask({ user, onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch(`http://localhost:5000/api/groups/user/${user._id}`);
      const data = await res.json();
      setGroups(data);
    };
    fetchGroups();
  }, [user]);

  const handleSubmit = async () => {
    await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        resourceLink,
        tags: tags.split(',').map(tag => tag.trim()),
        visibility,
        owner: user._id,
        group: visibility === 'group' ? groupId : null,
      }),
    });
    onTaskCreated();
    setTitle('');
    setDescription('');
    setResourceLink('');
    setTags('');
    setVisibility('private');
    setGroupId('');
  };

  return (
    <div className="form-container">
      <h3 className="form-title">Create Task</h3>

      <input
        className="form-input"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        className="form-textarea"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <input
        className="form-input"
        placeholder="Resource Link (optional)"
        value={resourceLink}
        onChange={e => setResourceLink(e.target.value)}
      />

      <input
        className="form-input"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={e => setTags(e.target.value)}
      />

      <select
        className="form-select"
        value={visibility}
        onChange={e => setVisibility(e.target.value)}
      >
        <option value="private">Private</option>
        <option value="group">Group</option>
        <option value="public">Public</option>
      </select>

      {visibility === 'group' && (
        <>
          <label className="form-title">Select Group:</label>
          <select
            className="form-select"
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
          >
            <option value="">-- Select Group --</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </>
      )}

      <button className="form-button" onClick={handleSubmit}>
        Create Task
      </button>
    </div>
  );
}
