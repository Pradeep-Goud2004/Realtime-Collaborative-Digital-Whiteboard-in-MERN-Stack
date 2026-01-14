import React from 'react';
import './UserList.css';

const UserList = ({ users, currentUser }) => {
  return (
    <div className="user-list">
      <h3>Users Online ({users.length})</h3>
      <div className="users">
        {users.map((user) => (
          <div
            key={user.userId}
            className={`user-item ${
              user.userId === currentUser.userId ? 'current-user' : ''
            }`}
          >
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">
              {user.username}
              {user.userId === currentUser.userId && ' (You)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;





