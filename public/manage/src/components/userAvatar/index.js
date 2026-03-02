// src/components/UserAvatar/index.js
import React from 'react';
import { getColorForUsername } from 'components/utils/AvatarColor';


const UserAvatar = ({ username, size = 32, className }) => {
  const color = getColorForUsername(username);
  const initials = username
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={className}
      style={{
        backgroundColor: color,
        color: '#fff',
        borderRadius: '50%',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size / 2.5,
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}
      title={username}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;