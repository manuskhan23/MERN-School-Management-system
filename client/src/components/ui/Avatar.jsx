import { assetUrl } from '../../utils/api.js';

export function Avatar({ user, size = 40 }) {
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${size * 0.4}px`,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: user.avatarColor || '#3b82f6',
    flexShrink: 0,
    overflow: 'hidden',
  };

  // If user has profile image, show it
  if (user.hasProfileImage && user.profileImage) {
    return (
      <img
        src={assetUrl(user.profileImage)}
        alt={user.name}
        style={{
          ...avatarStyle,
          objectFit: 'cover',
        }}
      />
    );
  }

  // Otherwise show initials
  return (
    <div style={avatarStyle} title={user.name}>
      {initials}
    </div>
  );
}
