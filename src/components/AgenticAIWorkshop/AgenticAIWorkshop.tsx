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
      date: 'Oct 1',
      title: 'Building the Foundation',
      subtitle: 'Basic Tools & Time-Awareness',
      topics: ['MCP fundamentals & tool creation', 'Time-aware agent behavior', 'Live Claude Desktop integration'],
      highlight: 'Build your first intelligent news agent'
    },
    {
      date: 'Oct 8', 
      title: 'Adding Memory',
      subtitle: 'Contextual Memory & User Interaction',
      topics: ['Vector memory systems', 'User elicitation patterns', 'Interest tracking & connections'],
      highlight: 'Create agents that learn and remember'
    },
    {
      date: 'Oct 15',
      title: 'Multi-Agent Systems', 
      subtitle: 'Predictive Multi-Agent Collaboration',
      topics: ['Multi-agent orchestration', 'Predictive intelligence', 'Agent collaboration patterns'],
      highlight: 'Build collaborative agent ecosystems'
    },
    {
      date: 'Oct 22',
      title: 'Student Showcases',
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
          <div className="hero-badge">🚀 NYU CDS Community Workshop</div>
          <h1 className="workshop-title">
            <span className="gradient-text">Agentic AI Workshop</span>
          </h1>
          <p className="workshop-subtitle">
            The Future of AI Interaction. Master cutting-edge Model Context Protocol to build intelligent agents that adapt, remember, and collaborate.
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
              <span>Oct 1-22, 2025</span>
            </div>
            <div className="detail-item">
              <span className="icon">🎬</span>
              <span>Technical story-telling</span>
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
        <div className="intro-section">
          <div className="intro-card">
            <h2>🤖 What is Agentic AI?</h2>
            <p className="intro-text">
              Agentic AI is all the buzz in 2025, both for businesses and employers. It refers to AI systems that can autonomously accomplish specific goals with limited supervision. These AI agents use tools, maintain memory, and mimic human decision-making to solve problems in real time, adapting their behavior based on context.
            </p>
            <p className="intro-highlight">
              Unlike traditional coding bootcamps, this is a laptops-closed <strong>"technical story-telling"</strong> experience where you'll watch agents come to life through live demonstrations—then create your own as homework each week.
            </p>
          </div>
        </div>

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
          <h2>Tech Stack & Benefits</h2>
          <p className="tech-intro">Modern tools for building production-ready agents</p>
          <div className="tech-benefits-grid">
            <div className="tech-column">
              <h3>Tools You'll Learn</h3>
              <div className="tech-grid">
                <div className="tech-item">
                  <span className="tech-icon">🔧</span>
                  <span>FastMCP</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">🤖</span>
                  <span>FastAgent</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">🧠</span>
                  <span>ChromaDB</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">⚡</span>
                  <span>Free OpenRouter Credits</span>
                </div>
              </div>
            </div>
            <div className="tech-column">
              <h3>Real-World Applications</h3>
              <div className="applications-list">
                <div className="application-item">
                  <span className="app-icon">🔬</span>
                  <span>Research automation</span>
                </div>
                <div className="application-item">
                  <span className="app-icon">💼</span>
                  <span>Job application workflows</span>
                </div>
                <div className="application-item">
                  <span className="app-icon">⚡</span>
                  <span>Personal productivity systems</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="format-section">
          <h2>Workshop Structure</h2>
          <div className="format-grid">
            <div className="format-card">
              <div className="format-icon">📚</div>
              <h3>60 Minutes Course Material</h3>
              <p>Technical story-telling with live demonstrations and agent building.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">❓</div>
              <h3>30 Minutes Q&A</h3>
              <p>Deep dive discussions and personalized guidance for your projects.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">🏠</div>
              <h3>1-2 Hours Homework</h3>
              <p>Weekly development time to build your personal news agent.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">🕐</div>
              <h3>Friday Office Hours</h3>
              <p>Personalized help and support for your agent development.</p>
            </div>
          </div>
        </div>

        <div className="learning-outcomes-section">
          <h2>Learning Outcomes</h2>
          <p className="outcomes-intro">This isn't just theory—you'll leave with:</p>
          <div className="outcomes-grid">
            <div className="outcome-card">
              <div className="outcome-icon">🤖</div>
              <h3>Working Agents</h3>
              <p>Functional agents you built yourself that solve real problems</p>
            </div>
            <div className="outcome-card">
              <div className="outcome-icon">🧠</div>
              <h3>Domain Knowledge</h3>
              <p>Skills to build intelligent systems for any domain or use case</p>
            </div>
            <div className="outcome-card">
              <div className="outcome-icon">⚖️</div>
              <h3>Strategic Understanding</h3>
              <p>Know when to use agents vs traditional applications</p>
            </div>
            <div className="outcome-card">
              <div className="outcome-icon">🚀</div>
              <h3>AI Revolution Position</h3>
              <p>Be at the forefront of the next wave of AI innovation</p>
            </div>
          </div>
        </div>

        <div className="instructor-section">
          <div className="instructor-card">
            <h2>About the Instructors</h2>
            <div className="instructors-grid">
              <div className="instructor-info">
                <h3>Adi Singhal</h3>
                <p className="instructor-bio">
                  Former CDS student and founder of the <strong>NYU Data Science Club</strong>. Currently at AWS helping build <strong>Amazon Q</strong>, the company's premiere agentic offering for developers and businesses.
                </p>
                <a href="https://www.linkedin.com/in/adi-singhal/" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="linkedin-button">
                  Connect on LinkedIn
                </a>
              </div>
              <div className="instructor-info">
                <h3>Luca Chang</h3>
                <p className="instructor-bio">
                  Works in the <strong>AWS Agentic AI organization</strong> and has contributed code to the official <strong>MCP Python SDK</strong> as part of his role. Expert in building production-ready agentic systems.
                </p>
                <a href="https://www.linkedin.com/in/luca-chang/" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="linkedin-button">
                  Connect on LinkedIn
                </a>
              </div>
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
            <h2>Ready to Build the Future?</h2>
            <p>Join the CDS community in mastering agentic AI and position yourself at the forefront of the AI revolution.</p>
            <div className="cta-buttons">
              <Link to="/agentic-ai-workshop/intake-form" className="primary-button large">
                Join the Workshop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticAIWorkshop;
