import { Link } from 'react-router-dom';
import './AgenticAIWorkshop.css';

const AgenticAIWorkshop = () => {
  const sessions = [
    {
      date: 'Sept 24',
      title: 'Foundations & Tool Integration',
      topics: ['Model interaction & prompting', 'Tool integrations', 'Managed solutions demo']
    },
    {
      date: 'Oct 1',
      title: 'External Systems & Memory',
      topics: ['Identity & credential management', 'Local embedding models', 'Memory systems']
    },
    {
      date: 'Oct 8',
      title: 'Multi-Agents & Deployment',
      topics: ['Multi-agent architectures', 'Hosting solutions', 'Production considerations']
    },
    {
      date: 'Oct 15',
      title: 'Project Showcase',
      topics: ['Student presentations', 'Advanced patterns', 'Next steps']
    }
  ];

  return (
    <div className="workshop-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="workshop-title">
            <span className="gradient-text">NYU Agentic AI Workshop</span>
          </h1>
          <p className="workshop-subtitle">
            Build cutting-edge AI agents that go beyond out-of-the-box solutions
          </p>
          <div className="workshop-details">
            <div className="detail-item">
              <span className="icon">📅</span>
              <span>Every Tuesday, Sept 24 - Oct 15</span>
            </div>
            <div className="detail-item">
              <span className="icon">🕐</span>
              <span>5:30 PM ET</span>
            </div>
            <div className="detail-item">
              <span className="icon">🎯</span>
              <span>Project-driven learning</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="objectives-section">
          <h2>What You'll Learn</h2>
          <div className="objectives-grid">
            <div className="objective-card">
              <div className="objective-icon">🤖</div>
              <h3>Cutting-edge Agentic AI</h3>
              <p>Master the latest techniques in autonomous AI systems</p>
            </div>
            <div className="objective-card">
              <div className="objective-icon">🔗</div>
              <h3>Protocols & Integration</h3>
              <p>Learn MCP and other modern AI protocols</p>
            </div>
            <div className="objective-card">
              <div className="objective-icon">⚡</div>
              <h3>Personal Automation</h3>
              <p>Build agents for your specific use cases</p>
            </div>
            <div className="objective-card">
              <div className="objective-icon">🛠️</div>
              <h3>Custom Solutions</h3>
              <p>Create what no existing tool can provide</p>
            </div>
          </div>
        </div>

        <div className="sessions-section">
          <h2>Workshop Sessions</h2>
          <div className="sessions-timeline">
            {sessions.map((session, index) => (
              <div key={index} className="session-card">
                <div className="session-date">{session.date}</div>
                <div className="session-content">
                  <h3>{session.title}</h3>
                  <ul>
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
          <div className="tech-grid">
            <div className="tech-item">🐍 Python Notebooks</div>
            <div className="tech-item">🦜 LangChain</div>
            <div className="tech-item">⚡ FastAgent</div>
            <div className="tech-item">🔧 Pydantic AI</div>
            <div className="tech-item">🤗 HuggingFace</div>
            <div className="tech-item">🐳 Docker</div>
          </div>
        </div>

        <div className="format-section">
          <h2>Workshop Format</h2>
          <div className="format-grid">
            <div className="format-card">
              <h3>📚 Classroom Style</h3>
              <p>Interactive learning with hands-on coding</p>
            </div>
            <div className="format-card">
              <h3>🎬 Recorded Sessions</h3>
              <p>1 hour recorded + 30 mins off-camera practice</p>
            </div>
            <div className="format-card">
              <h3>📝 Homework & Projects</h3>
              <p>Build your own agent throughout the series</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Build the Future?</h2>
            <p>Join us for this intensive workshop series and create AI agents that solve real problems.</p>
            <Link to="/agentic-ai-workshop/intake-form" className="cta-button">
              Fill Out Intake Form
            </Link>
            <div className="cta-note">
              <strong>Commitment Required:</strong> Attend all sessions to get the most out of this workshop series.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticAIWorkshop;
