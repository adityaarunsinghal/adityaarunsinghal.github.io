import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './AgenticAIWorkshop.css';

const AgenticAIWorkshop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sessions = [
    {
      date: 'Sept 24',
      title: 'Building the Kitchen',
      subtitle: 'Simple Tools & Time-Awareness',
      topics: ['MCP fundamentals & tool creation', 'Time-aware agent behavior', 'Live Claude Desktop integration'],
      highlight: 'Build your first intelligent news agent'
    },
    {
      date: 'Oct 1', 
      title: 'Remembering the Regulars',
      subtitle: 'Contextual Memory & Interaction',
      topics: ['Vector memory systems', 'User elicitation patterns', 'Interest tracking & connections'],
      highlight: 'Create agents that learn and remember'
    },
    {
      date: 'Oct 8',
      title: 'The Full Kitchen Brigade', 
      subtitle: 'Predictive Multi-Agent Systems',
      topics: ['Multi-agent orchestration', 'Predictive intelligence', 'Agent collaboration patterns'],
      highlight: 'Build collaborative agent ecosystems'
    },
    {
      date: 'Oct 15',
      title: 'Showcase Day',
      subtitle: 'Demo Your Creations',
      topics: ['Student presentations', 'Peer feedback', 'Advanced patterns & next steps'],
      highlight: 'Show off what you built'
    }
  ];

  const features = [
    {
      icon: '🧠',
      title: 'Intelligence Amplification',
      description: 'Build agents that make you smarter, not just faster'
    },
    {
      icon: '🔧',
      title: 'Model Context Protocol',
      description: 'Master the cutting-edge standard for AI tool integration'
    },
    {
      icon: '⚡',
      title: 'Live Coding',
      description: 'Watch real agents come to life in interactive sessions'
    },
    {
      icon: '🎯',
      title: 'Personal Projects',
      description: 'Build agents for your actual needs, not toy examples'
    }
  ];

  return (
    <div className={`workshop-container ${isVisible ? 'fade-in' : ''}`}>
      <div className="claude-credit">Made by Claude with love ❤️</div>
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-badge">🚀 NYU Exclusive Workshop</div>
          <h1 className="workshop-title">
            <span className="gradient-text">Agentic AI Workshop</span>
          </h1>
          <p className="workshop-subtitle">
            Build intelligent agents that adapt, remember, and collaborate using Model Context Protocol
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">4</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat">
              <span className="stat-number">90</span>
              <span className="stat-label">Minutes Each</span>
            </div>
            <div className="stat">
              <span className="stat-number">2</span>
              <span className="stat-label">Personal Agents</span>
            </div>
          </div>
          <div className="workshop-details">
            <div className="detail-item">
              <span className="icon">📅</span>
              <span>Wednesdays 5:00-6:30 PM</span>
            </div>
            <div className="detail-item">
              <span className="icon">📍</span>
              <span>Sept 24 - Oct 15, 2025</span>
            </div>
            <div className="detail-item">
              <span className="icon">🎬</span>
              <span>Show-and-tell format</span>
            </div>
          </div>
          <div className="hero-cta">
            <Link to="/agentic-ai-workshop/intake-form" className="primary-button">
              Join the Workshop
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <a href="https://github.com/adityaarunsinghal/news-agent/" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="secondary-button">
                View Repository
              </a>
              <span style={{ fontSize: '0.8rem', opacity: '0.6', marginTop: '5px' }}>(temporarily locked)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="analogy-section">
          <div className="analogy-card">
            <h2>🍽️ The Restaurant Analogy</h2>
            <div className="analogy-grid">
              <div className="analogy-item">
                <span className="analogy-icon">👨‍🍳</span>
                <h4>MCP Server = Kitchen</h4>
                <p>All the tools and ingredients (resources) you need</p>
              </div>
              <div className="analogy-item">
                <span className="analogy-icon">🍽️</span>
                <h4>Client = Waiter</h4>
                <p>Takes orders and delivers results (Claude, your app)</p>
              </div>
              <div className="analogy-item">
                <span className="analogy-icon">🧠</span>
                <h4>Agent = Chef's Expertise</h4>
                <p>The intelligence that adapts and creates</p>
              </div>
            </div>
            <div className="analogy-quote">
              "A vending machine has fixed buttons. A restaurant adapts — same kitchen, infinite possibilities."
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2>Why This Workshop?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sessions-section">
          <h2>Workshop Journey</h2>
          <div className="sessions-timeline">
            {sessions.map((session, index) => (
              <div key={index} className="session-card">
                <div className="session-number">{index + 1}</div>
                <div className="session-date">{session.date}</div>
                <div className="session-content">
                  <h3>{session.title}</h3>
                  <p className="session-subtitle">{session.subtitle}</p>
                  <div className="session-highlight">{session.highlight}</div>
                  <ul className="session-topics">
                    {session.topics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tech-stack-section">
          <h2>Tech Stack</h2>
          <p className="tech-intro">Modern tools for building production-ready agents</p>
          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-icon">🔧</span>
              <span>FastMCP</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🤖</span>
              <span>Claude Desktop</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🧠</span>
              <span>ChromaDB</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">📰</span>
              <span>Hacker News API</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🐍</span>
              <span>Python Notebooks</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">⚡</span>
              <span>OpenRouter</span>
            </div>
          </div>
        </div>

        <div className="format-section">
          <h2>Workshop Experience</h2>
          <div className="format-grid">
            <div className="format-card">
              <div className="format-icon">👥</div>
              <h3>Classroom Style</h3>
              <p>Laptops closed, minds open. Watch, discuss, and learn together.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">🎬</div>
              <h3>Live Coding</h3>
              <p>See agents built from scratch with one-click Jupyter notebooks.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">🏠</div>
              <h3>Build Your Own</h3>
              <p>Create your personal agent as homework between sessions.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">🕐</div>
              <h3>Office Hours</h3>
              <p>Friday end-of-day support for your projects.</p>
            </div>
          </div>
        </div>

        <div className="commitment-section">
          <div className="commitment-card">
            <h2>🎯 What We Expect</h2>
            <div className="commitment-grid">
              <div className="commitment-item">
                <span className="commitment-icon">✅</span>
                <span>Attend all 4 sessions</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">💻</span>
                <span>Complete homework projects</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">🤝</span>
                <span>Participate in discussions</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">🚀</span>
                <span>Present your final agent</span>
              </div>
            </div>
            <p className="commitment-note">
              This isn't a casual overview — it's an intensive workshop for serious builders.
            </p>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Build Intelligent Agents?</h2>
            <p>Join a select group of NYU students building the future of AI interaction.</p>
            <div className="cta-buttons">
              <Link to="/agentic-ai-workshop/intake-form" className="primary-button large">
                Fill Intake Form
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticAIWorkshop;
