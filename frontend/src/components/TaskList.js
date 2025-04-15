import React from 'react';
import '../App.css'; 

export default function TaskList({ tasks, onComplete, onDelete }) {
  return (
    <div>
      <h3 className="form-title">Your Tasks</h3>
      <ul className="task-list">
        {tasks.map(task => (
          <li
            key={task._id}
            className={`task-item ${task.completed ? 'task-completed' : ''}`}
          >
            <h4>
              {task.title} {task.completed && '✅'}
            </h4>
            <p>{task.description}</p>

            {task.resourceLink && (
              <a href={task.resourceLink} target="_blank" rel="noreferrer">
                Resource
              </a>
            )}

            <p>Tags: {task.tags.join(', ')}</p>

            <div className="task-actions">
              {!task.completed && (
                <button
                  className="action-button complete-button"
                  onClick={() => onComplete(task._id)}
                >
                  Mark Completed
                </button>
              )}
              <button
                className="action-button delete-button"
                onClick={() => onDelete(task._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
