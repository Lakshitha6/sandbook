import './css/About.css';

export default function About() {
  return (
    <div className="about-container">
      <h1 className="about-title">Welcome to Sandbook</h1>
      
      <p className="about-intro">
        Sandbook is a lightweight social media platform built for simplicity, connection, and a smooth user experience.
      </p>

      <h2 className="about-section-title">🌟 Key Features</h2>
      <ul className="features-list">
        <li><strong>🔐 Secure Authentication:</strong> Login and register with secure using JWT authentication.</li>
        <li><strong>👥 Friend System:</strong> Send and accept friend requests. Manage your friend list easily.</li>
        <li><strong>📬 Feed:</strong> View posts from your friends</li>
        <li><strong>📬 Profile:</strong> View your posts and create new posts</li>
        <li><strong>📝 Create Posts:</strong> Share updates, messages, or thoughts with your friends.</li>
        <li><strong>🔎 Discover Users:</strong> View and add new users who aren't yet your friends.</li>
        <li><strong>💡 Clean UI:</strong> Simple and user friendly interface built with React and modern CSS.</li>
      </ul>

      <h2 className="about-section-title">🚀 Technologies Used</h2>
      <ul className="tech-list">
        <li><strong>Frontend:</strong> React, CSS</li>
        <li><strong>Backend:</strong> Fast API(python) JWT for authentication</li>
        <li><strong>Database:</strong> PostgreSQL</li>
      </ul>

      <h2 className="about-section-title">💬 Why Sandbook?</h2>
      <p className="about-text">
        The goal of Sandbook is to create a clean and educational social platform for learning and showcasing full stack development skills. It’s ideal for students and developers who want a practical project to build upon and expand.
      </p>

      <p className="about-footer">
        Thanks for using Sandbook! Stay connected and keep coding. 💻✨
      </p>
    </div>
  );
}
