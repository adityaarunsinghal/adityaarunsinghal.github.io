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
  isFront: boolean;
}

const AnimatedQuote = ({ item, allItems, index, onUpdate, onBringToFront }: { 
  item: HypeData; 
  allItems: HypeData[]; 
  index: number;
  onUpdate: (index: number, x: number, y: number, vx: number, vy: number) => void;
  onBringToFront: (index: number) => void;
}) => {
  const animationRef = useRef<number>();
  const frameCount = useRef<number>(0);
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
    
    if (!item.isFront) {
      // First touch: bring to front and reset others
      onBringToFront(index);
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
      className={`word-cloud-item animated ${item.isFront ? 'front' : ''}`}
      style={{
        fontSize: `${item.size}px`,
        color: item.color,
        left: `${item.x}px`,
        top: `${item.y}px`,
        position: 'absolute',
        cursor: isValidUrl(item.url) ? 'pointer' : 'default',
        zIndex: (item.isFront || isHovered) ? 100 : 1
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

  const bringToFront = (index: number) => {
    setHypeData(prev => prev.map((item, i) => 
      ({ ...item, isFront: i === index })
    ));
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Load CSV data using papaparse
    fetch('/hype.csv')
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
                  vy: distance > 0 ? (dy / distance) * pushForce : (Math.random() - 0.5) * 2,
                  isFront: false
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
            vy: 1,
            isFront: false
          }
        ]);
      });
  }, []);

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
            <Link to="/agentic-ai-workshop/registration-form" className="primary-button">
              Join the Workshop
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <a href="https://github.com/adityaarunsinghal/agentic-ai-workshop-2025" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="secondary-button">
                View Public Repository
              </a>
              {/* <span style={{ fontSize: '0.8rem', opacity: '0.6', marginTop: '5px' }}>(temporarily locked)</span> */}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <a href="mailto:adityaarunsinghal@gmail.com?subject=Planning to come to office hours - <your name>&body=Hey Adi,%0D%0A%0D%0APlanning to come to office hours this Friday at 4:30pm ET (or asking if possible to talk at a different time for a bit).%0D%0A%0D%0AHere is a bit about me: <fill this>"
                 className="secondary-button">
                Come to Office Hours
              </a>
              <span style={{ fontSize: '0.8rem', opacity: '0.6', marginTop: '5px' }}>(Fridays 4:30pm ET)</span>
            </div>
            <Link to="/agentic-ai-workshop/feedback" className="secondary-button">
              Workshop Feedback
            </Link>
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
                onBringToFront={bringToFront}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticAIWorkshop;
