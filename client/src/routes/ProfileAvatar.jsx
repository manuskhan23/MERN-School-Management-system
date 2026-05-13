// client/src/components/ProfileAvatar.jsx
import React from 'react';
import { getFirstLetter, getRandomColor } from './avatarUtils';

const defaultAvatarStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '40px', // Example size, adjust as needed
  height: '40px', // Example size, adjust as needed
  borderRadius: '50%',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '18px', // Adjust font size as needed
  backgroundColor: '#cccccc', // Fallback default color
};

export function ProfileAvatar({ userName, profilePictureUrl, avatarColor }) {
  if (profilePictureUrl) {
    return (
      <img
        src={profilePictureUrl}
        alt={`${userName}'s profile`}
        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }

  const firstLetter = getFirstLetter(userName);
  return (<div style={{ ...defaultAvatarStyle, backgroundColor: avatarColor }}>{firstLetter}</div>);
}