// client/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '../../routes/ProfileAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx'; // Assuming your AuthContext is here
import { NAV_LINKS } from '../../utils/navigation.js'; // Import the new navigation links

export function Sidebar() {
  const { user, logout } = useAuth(); // Get user and logout function from AuthContext
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  // If no user is logged in, the sidebar might not be rendered by ProtectedRoute,
  // but as a safeguard, we can return null or a minimal component.
  // Given AppLayout is protected, `user` should typically always be available here.
  if (!user) {
    return null;
  }

  // Filter navigation links based on the user's role
  const filteredNavLinks = NAV_LINKS.filter(link => link.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="https://usman.edu.pk/resources/images/new_logo.png" height={"8px"} alt="" />
      </div>
      <div className="sidebar-profile" style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
        <ProfileAvatar
          userName={user.name}
          profilePictureUrl={user.profileImage}
          avatarColor={user.avatarColor}
        />
        <div style={{ marginLeft: '10px' }}>
          <p className="profile-name" style={{ margin: 0, fontWeight: 'bold' }}>{user.name}</p>
          <p className="profile-role" style={{ margin: 0, fontSize: '0.8em', color: '#666' }}>{user.role}</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul
  style={{
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  }}
>
  {filteredNavLinks.map((link) => (
    <li key={link.path}>
      <Link
        to={link.path}
        style={{
          textDecoration: "none",
          color: "#ffffff",
          background: "linear-gradient(145deg, #111111, #1a1a1a)",
          padding: "14px 18px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          fontWeight: "600",
          letterSpacing: "0.5px",
          transition: "all 0.3s ease",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(145deg, #ffffff, #d9d9d9)";
          e.currentTarget.style.color = "#000";
          e.currentTarget.style.transform = "translateX(8px) scale(1.02)";
          e.currentTarget.style.boxShadow =
            "0 8px 20px rgba(255,255,255,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(145deg, #111111, #1a1a1a)";
          e.currentTarget.style.color = "#ffffff";
          e.currentTarget.style.transform = "translateX(0) scale(1)";
          e.currentTarget.style.boxShadow =
            "0 6px 14px rgba(0,0,0,0.35)";
        }}
      >
        {link.label}
      </Link>
    </li>
  ))}

  <li style={{ marginTop: "10px" }}>
    <button
      onClick={handleLogout}
      style={{
        width: "100%",
        padding: "14px",
        background: "linear-gradient(145deg, #dc2626, #991b1b)",
        color: "#fff",
        border: "none",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px",
        transition: "all 0.3s ease",
        boxShadow: "0 6px 14px rgba(220,38,38,0.35)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow =
          "0 8px 18px rgba(220,38,38,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 6px 14px rgba(220,38,38,0.35)";
      }}
    >
      Logout
    </button>
  </li>
</ul>
      </nav>
    </aside>
  );
}