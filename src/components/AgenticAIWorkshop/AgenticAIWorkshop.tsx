import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { animated } from '@react-spring/web';
import Papa from 'papaparse';
import './AgenticAIWorkshop.css';

interface CSVRow {
  Quote_Description?: string;
  Person_Organization?: string;
  Hype_Value?: string;
  Direct_Link?: string;
}

interface HypeData {
  quote: string;
  speaker: string;
  hype: number;
  url: string;
  color: string;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const AnimatedQuote = ({ item, allItems, index, onUpdate }: { 
  item: HypeData; 
  allItems: HypeData[]; 
  index: number;
  onUpdate: (index: number, x: number, y: number, vx: number, vy: number) => void;
}) => {
  const animationRef = useRef<number>();
  const frameCount = useRef<number>(0);
  const [isFront, setIsFront] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const animate = () => {
      let { x, y, vx, vy } = item;
      
      // Only calculate forces every 10 frames
      if (frameCount.current % 10 === 0) {
        // Simple repulsion from other items (use current positions)
        allItems.forEach((other, i) => {
          if (i !== index) {
            const dx = x - other.x;
            const dy = y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < 150) {
              const force = 2.0 / distance;
              vx += (dx / distance) * force;
              vy += (dy / distance) * force;
            }
          }
        });
      }
      
      frameCount.current++;
      
      // Always apply velocity (momentum)
      x += vx;
      y += vy;
      
      // Bounce off walls (responsive bounds)
      const isMobile = window.innerWidth <= 768;
      const maxX = isMobile ? 300 : 900;
      const maxY = isMobile ? 500 : 800;
      
      if (x < 0 || x > maxX) vx *= -0.8;
      if (y < 0 || y > maxY) vy *= -0.8;
      
      // Keep in bounds (responsive)
      x = Math.max(0, Math.min(maxX, x));
      y = Math.max(0, Math.min(maxY, y));
      
      // Limit max speed
      const maxSpeed = 2;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > maxSpeed) {
        vx = (vx / speed) * maxSpeed;
        vy = (vy / speed) * maxSpeed;
      }
      
      // Light damping
      vx *= 0.995;
      vy *= 0.995;
      
      onUpdate(index, x, y, vx, vy);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [item, allItems, index, onUpdate]); // allItems dependency ensures fresh data

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleClick = (e: React.MouseEvent, url: string) => {
    if (!isValidUrl(url)) {
      e.preventDefault();
    }
  };

  const handleTouch = (e: React.TouchEvent, url: string) => {
    e.preventDefault();
    
    if (!isFront) {
      // First touch: bring to front
      setIsFront(true);
    } else if (isValidUrl(url)) {
      // Second touch: navigate
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <animated.a
      href={isValidUrl(item.url) ? item.url : undefined}
      target={isValidUrl(item.url) ? "_blank" : undefined}
      rel={isValidUrl(item.url) ? "noopener noreferrer" : undefined}
      className="word-cloud-item animated"
      style={{
        fontSize: `${item.size}px`,
        color: item.color,
        left: `${item.x}px`,
        top: `${item.y}px`,
        position: 'absolute',
        cursor: isValidUrl(item.url) ? 'pointer' : 'default',
        zIndex: (isFront || isHovered) ? 100 : 1
      }}
      onClick={(e) => handleClick(e, item.url)}
      onTouchEnd={(e) => handleTouch(e, item.url)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="quote-content">
        <div className="quote-text">"{item.quote}"</div>
        <div className="quote-speaker">— {item.speaker}</div>
      </div>
    </animated.a>
  );
};

const AgenticAIWorkshop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hypeData, setHypeData] = useState<HypeData[]>([]);

  const updateItem = (index: number, x: number, y: number, vx: number, vy: number) => {
    setHypeData(prev => prev.map((item, i) => 
      i === index ? { ...item, x, y, vx, vy } : item
    ));
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Load CSV data using papaparse
    fetch('/src/components/AgenticAIWorkshop/hype.csv')
      .then(response => response.text())
      .then(csvText => {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#00d2d3', '#ff6348', '#2ed573', '#ffa502', '#e17055', '#74b9ff', '#fd79a8', '#fdcb6e', '#00b894', '#e84393', '#55a3ff', '#26de81', '#fc5c65'];
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const data = (results.data as CSVRow[])
              .filter((row: CSVRow) => row.Quote_Description && row.Hype_Value)
              .map((row: CSVRow, index: number) => {
                const hype = parseInt(row.Hype_Value || '0') || 0;
                const size = 12 + (hype / 100) * 20;
                const isMobile = window.innerWidth <= 768;
                const maxX = isMobile ? 300 : 900;
                const maxY = isMobile ? 500 : 800;
                const centerX = maxX / 2;
                const centerY = maxY / 2;
                const x = Math.random() * maxX;
                const y = Math.random() * maxY;
                
                // Initial outward push from center
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const pushForce = 3;
                
                return {
                  quote: (row.Quote_Description || '').replace(/"/g, ''),
                  speaker: row.Person_Organization || 'Unknown',
                  hype,
                  url: row.Direct_Link || '#',
                  color: colors[index % colors.length],
                  size,
                  x,
                  y,
                  vx: distance > 0 ? (dx / distance) * pushForce : (Math.random() - 0.5) * 2,
                  vy: distance > 0 ? (dy / distance) * pushForce : (Math.random() - 0.5) * 2
                };
              });
            
            setHypeData(data);
          }
        });
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setHypeData([
          { 
            quote: 'AI agents will transform the workforce', 
            speaker: 'Tech Leader',
            hype: 100, 
            color: '#ff6b6b', 
            url: '#',
            size: 32,
            x: 450,
            y: 400,
            vx: 1,
            vy: 1
          }
        ]);
      });
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
            <Link to="/agentic-ai-workshop/registration-form" className="primary-button">
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
              <Link to="/agentic-ai-workshop/registration-form" className="primary-button large">
                Join the Workshop
              </Link>
            </div>
          </div>
        </div>

        <div className="word-cloud-section">
          <h2>Inspect the Hype</h2>
          <div className="word-cloud">
            {hypeData.map((item, index) => (
              <AnimatedQuote 
                key={index} 
                item={item} 
                allItems={hypeData}
                index={index} 
                onUpdate={updateItem}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticAIWorkshop;
