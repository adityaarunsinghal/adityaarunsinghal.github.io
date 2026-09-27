import { quotes } from '../../workshop/quotes';

// Course body preserved from b349c17; year navigation and quote presentation are archival additions.
const AgenticAIWorkshop2025 = () => {
  const sessions = [
    {
      date: 'Oct 1',
      title: 'Building the Foundation',
      subtitle: 'From LLM Calls to MCP Tools',
      topics: ['LLM evolution & tool use fundamentals', 'MCP introduction & server setup', 'Building your first newspaper agent', 'Anti-patterns and teaching moments'],
      highlight: 'Watch agents come to life through live demonstrations'
    },
    {
      date: 'Oct 8', 
      title: 'Adding Memory & Context',
      subtitle: 'Vector Storage & Conversation Management',
      topics: ['Context bursting problems & solutions', 'ChromaDB for vector memory', 'MCP sampling and elicitation features', 'Conversation compaction strategies'],
      highlight: 'Solve real context management challenges'
    },
    {
      date: 'Oct 15',
      title: 'Multi-Agent Collaboration', 
      subtitle: 'Predictive Intelligence & Agent Orchestration',
      topics: ['Multi-agent newspaper personalization', 'Predictive intelligence patterns', 'Production hosting options survey', 'Agent collaboration workflows'],
      highlight: 'Build collaborative newspaper creation system'
    },
    {
      date: 'Oct 22',
      title: 'Student Showcases',
      subtitle: 'Demo Your Creations',
      topics: ['Student presentations', 'Peer feedback sessions', 'Advanced patterns & next steps', 'Production deployment strategies'],
      highlight: 'Present your personalized agents'
    }
  ];

  const features = [
    {
      icon: '🧠',
      title: 'Live Demonstrations',
      description: 'Watch real agents built through pre-written Jupyter notebooks that run with one click'
    },
    {
      icon: '🔧',
      title: 'Model Context Protocol',
      description: 'Master MCP through FastAgent, Copilot, and Cursor integrations'
    },
    {
      icon: '⚡',
      title: 'Technical Story-telling',
      description: 'Laptops closed - observe, discuss, and learn through guided demonstrations'
    },
    {
      icon: '🎯',
      title: 'Newspaper Agent Project',
      description: 'Build a personalized news application with collaborative agents'
    }
  ];

  return (
    <main className="workshop-2025" id="main-content">
      <header className="archive-banner">
        <strong>2025 workshop archive</strong>
        <p>These materials describe the October 2025 course.</p>
        <nav aria-label="Archive navigation">
          <a href="/agentic-ai-workshop/">Visit the 2026 workshop</a>
          <a href="https://www.youtube.com/playlist?list=PLgF7i4LH-YxYvhXK-yywN7eFRjRjQrq89">2025 highlights</a>
          <a href="https://github.com/adityaarunsinghal/agentic-ai-workshop-2025">2025 code</a>
        </nav>
      </header>
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-badge">🚀 NYU CDS Community Workshop</div>
          <h1 className="workshop-title">
            <span className="gradient-text">Agentic AI Workshop</span>
          </h1>
          <p className="workshop-subtitle">
            Master cutting-edge Model Context Protocol through live demonstrations. Build a personalized newspaper creation application using two collaborative agents.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">3+1</span>
              <span className="stat-label">Sessions + Showcase</span>
            </div>
            <div className="stat">
              <span className="stat-number">90</span>
              <span className="stat-label">Minutes Each</span>
            </div>
            <div className="stat">
              <span className="stat-number">1</span>
              <span className="stat-label">News Agent Project</span>
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
            
            <a href="https://www.youtube.com/playlist?list=PLgF7i4LH-YxYvhXK-yywN7eFRjRjQrq89" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="primary-button">
              View Highlights
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <a href="https://github.com/adityaarunsinghal/agentic-ai-workshop-2025" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="secondary-button">
                View Public Repository
              </a>
              
            </div>
            
            <a href="/agentic-ai-workshop-2025/feedback/" className="secondary-button">
              Workshop Feedback
            </a>
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
              This is a <strong>"technical story-telling"</strong> experience where you'll watch agents come to life through live demonstrations using pre-written Jupyter notebooks—then build your own newspaper agent as optional homework each week.
            </p>
          </div>
        </div>

        <div className="analogy-section">
          <div className="analogy-card">
            <h2>🍽️ The Restaurant Analogy</h2>
            <div className="analogy-grid">
              <div className="analogy-item">
                <span className="analogy-icon">👨‍🍳</span>
                <h3>MCP Server = Kitchen</h3>
                <p>All the tools and ingredients (resources) you need</p>
              </div>
              <div className="analogy-item">
                <span className="analogy-icon">🍽️</span>
                <h3>Client = Waiter</h3>
                <p>Takes orders and delivers results (Claude, your app)</p>
              </div>
              <div className="analogy-item">
                <span className="analogy-icon">🧠</span>
                <h3>Agent = Chef's Expertise</h3>
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
          <h2>Tech Stack & Development Environment</h2>
          <p className="tech-intro">Pre-written Jupyter notebooks and modern MCP tools</p>
          <div className="tech-benefits-grid">
            <div className="tech-column">
              <h3>Tools & Platforms</h3>
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
                  <span className="tech-icon">💻</span>
                  <span>Copilot & Cursor</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">🧠</span>
                  <span>ChromaDB</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">⚡</span>
                  <span>Free OpenRouter Credits</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">📓</span>
                  <span>Jupyter Notebooks</span>
                </div>
              </div>
            </div>
            <div className="tech-column">
              <h3>Key Learning Areas</h3>
              <div className="applications-list">
                <div className="application-item">
                  <span className="app-icon">🔧</span>
                  <span>Context bursting solutions</span>
                </div>
                <div className="application-item">
                  <span className="app-icon">🧠</span>
                  <span>Conversation management</span>
                </div>
                <div className="application-item">
                  <span className="app-icon">⚡</span>
                  <span>MCP sampling & elicitation</span>
                </div>
                <div className="application-item">
                  <span className="app-icon">🏗️</span>
                  <span>Production hosting patterns</span>
                </div>
                <div className="application-item">
                  <span className="app-icon">⚠️</span>
                  <span>Anti-patterns & debugging</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="format-section">
          <h2>Workshop Structure</h2>
          <div className="format-grid">
            <div className="format-card">
              <div className="format-icon">🎬</div>
              <h3>15 Minutes Pre-Discussion</h3>
              <p>Session kickoff with community discussion and context setting.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">📚</div>
              <h3>60 Minutes Live Demo</h3>
              <p>Technical story-telling with live Jupyter notebook demonstrations.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">❓</div>
              <h3>15 Minutes Q&A</h3>
              <p>Interactive discussion and personalized guidance for your projects.</p>
            </div>
            <div className="format-card">
              <div className="format-icon">🏠</div>
              <h3>Optional Homework</h3>
              <p>Build your own newspaper agent using provided notebooks as foundation.</p>
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
                  Works in the <strong>AWS Agentic AI organization</strong> and is a regular contributor to the <strong>MCP specification and SDKs</strong>. Expert in building production-ready agentic systems.
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
                <span>Attend sessions</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">💻</span>
                <span>Engage with optional homework</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">🤝</span>
                <span>Participate in discussions</span>
              </div>
              <div className="commitment-item">
                <span className="commitment-icon">🚀</span>
                <span>Share your learnings</span>
              </div>
            </div>
            <p className="commitment-note">
              A collaborative learning experience for builders interested in agentic AI.
            </p>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Explore Agentic AI?</h2>
            <p>Join the CDS community in learning about agentic AI through hands-on demonstrations and collaborative exploration.</p>
            <div className="cta-buttons">
              <a href="https://www.youtube.com/playlist?list=PLgF7i4LH-YxYvhXK-yywN7eFRjRjQrq89" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="primary-button large">
                View Highlights
              </a>
            </div>
          </div>
        </div>

        <div className="word-cloud-section">
          <h2>Inspect the Hype</h2>
          <details className="archive-quotes">
            <summary>Read the historical quotations and their sources</summary>
            <ul>
              {quotes.map((item, index) => (
                <li key={index}>
                  <blockquote><p>{item.quote}</p><footer>{item.speaker}</footer></blockquote>
                  {item.url && <a href={item.url}>Original source</a>}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </main>
  );
};

export default AgenticAIWorkshop2025;
