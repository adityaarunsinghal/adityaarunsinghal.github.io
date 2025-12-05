// src/components/LovesIngy/LovesIngy.tsx
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './LovesIngy.css';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from '../../firebase';

interface LoveMessage {
  id: string;
  message: string;
  timestamp: string;
}

interface CountdownEvent {
  emoji: string;
  name: string;
  date: string; // YYYY-MM-DD format
}

const EMOJI_OPTIONS = [
  '🎄', '🎂', '💍', '✈️', '🎉', '💝', '🌴', '🎓', '👶', '🏠', '💐', '🎁', 
  '🏖️', '💒', '🎪', '🎭', '🎸', '⚽', '🎮', '📚', '🍕', '☕', '🌟', '🔥',
  '💻', '🎨', '🎬', '🎵', '🏆', '🎯', '🚀', '⭐', '💎', '🌈', '🦄', '🐶',
  '🐱', '🦋', '🌸', '🌺', '🌻', '🌹', '🍰', '🧁', '🍾', '🥂', '🎊', '🎈'
];

const LovesIngy = () => {
  const [loveMessages, setLoveMessages] = useState<LoveMessage[]>([]);
  const [newLoveMessage, setNewLoveMessage] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Countdown state
  const [countdownEvents, setCountdownEvents] = useState<CountdownEvent[]>([]);
  const [countdownLoading, setCountdownLoading] = useState(true);
  const [countdownSaving, setCountdownSaving] = useState(false);
  const [showCountdownForm, setShowCountdownForm] = useState(false);
  const [newEvent, setNewEvent] = useState<CountdownEvent>({ emoji: '🎉', name: '', date: '' });
  const [showCountdowns, setShowCountdowns] = useState(false);

  // Load love messages
  useEffect(() => {
    const loveMessagesRef = collection(db, 'love-ingy-messages');
    const queryOrderByTimestamp = query(loveMessagesRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(queryOrderByTimestamp, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message,
          timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
        };
      });
      setLoveMessages(messages);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please refresh the page.');
      if (error.code === 'permission-denied') {
        setError('Access denied. You do not have permission to view these messages.');
      }
    });

    return unsubscribe;
  }, []);

  // Load countdown events
  useEffect(() => {
    const loadCountdowns = async () => {
      try {
        const docRef = doc(db, 'trmnl-config', 'countdowns');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const events = data.events;
          setCountdownEvents(Array.isArray(events) ? events : []);
        }
      } catch (error) {
        console.error('Error loading countdowns:', error);
      } finally {
        setCountdownLoading(false);
      }
    };
    
    loadCountdowns();
  }, []);

  const saveCountdowns = async (updatedEvents: CountdownEvent[]) => {
    setCountdownSaving(true);
    try {
      const docRef = doc(db, 'trmnl-config', 'countdowns');
      await setDoc(docRef, { events: updatedEvents });
      setCountdownEvents(updatedEvents);
    } catch (error) {
      console.error('Error saving countdowns:', error);
      alert('Failed to save countdown. Please try again.');
    } finally {
      setCountdownSaving(false);
    }
  };

  const addCountdownEvent = async () => {
    if (!newEvent.name.trim() || !newEvent.date) {
      alert('Please fill in all fields');
      return;
    }
    
    const updatedEvents = [...countdownEvents, newEvent].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    await saveCountdowns(updatedEvents);
    setNewEvent({ emoji: '🎉', name: '', date: '' });
    setShowCountdownForm(false);
  };

  const deleteCountdownEvent = async (index: number) => {
    if (confirm('Delete this countdown?')) {
      const updatedEvents = countdownEvents.filter((_, i) => i !== index);
      await saveCountdowns(updatedEvents);
    }
  };

  const getDaysUntil = (date: string) => {
    const eventDate = new Date(date + 'T00:00:00');
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddLoveMessage = async () => {
    if (newLoveMessage.trim() === '') {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    try {
      const loveMessagesRef = collection(db, 'love-ingy-messages');
      let messageData = {
        message: newLoveMessage,
        timestamp: serverTimestamp(),
      };

      // Check if newLoveMessage is a valid JSON
      try {
        const parsedMessage = JSON.parse(newLoveMessage);
        if (parsedMessage && typeof parsedMessage === 'object') {
          messageData = {
            message: parsedMessage.text,
            timestamp: new Timestamp(parsedMessage.timestamp / 1000, parsedMessage.timestamp % 1000),
          };
        }
      } catch {
        // Not a JSON, proceed with original message
      }

      await addDoc(loveMessagesRef, messageData);
      setNewLoveMessage('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // Milestone celebration
      if ((loveMessages.length + 1) % 10 === 0) {
        triggerMilestoneCelebration();
      }
    } catch (error: unknown) {
      console.error('Error adding message:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        alert('Access denied. You do not have permission to add messages.');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLoveMessage();
    }
  };

  const triggerHeartShower = () => {
    const heart = confetti.shapeFromText({ text: '💛', scalar: 2 });
    
    confetti({
      shapes: [heart],
      scalar: 1.5,
      spread: 180,
      particleCount: 30,
      origin: { y: 0.1 },
      startVelocity: 35,
      gravity: 0.8,
      drift: 0,
      ticks: 200
    });
    
    setTimeout(() => {
      confetti({
        shapes: [heart],
        scalar: 1.2,
        spread: 120,
        particleCount: 20,
        origin: { y: 0.2, x: 0.8 },
        startVelocity: 25,
        gravity: 0.6,
        ticks: 150
      });
    }, 200);
  };

  const triggerMilestoneCelebration = () => {
    const heart = confetti.shapeFromText({ text: '💛', scalar: 2 });
    confetti({
      shapes: [heart],
      particleCount: 50,
      spread: 360,
      origin: { y: 0.5 },
      scalar: 2,
      gravity: 1,
      ticks: 300
    });
  };

  return (
    <>
      <div className='love-ingy-body'></div>
      <button 
        className="heart-button"
        onClick={triggerHeartShower}
        title="💛"
      >
        💛
      </button>
      
      {/* Countdown toggle button */}
      <button 
        className="countdown-toggle-button"
        onClick={() => setShowCountdowns(!showCountdowns)}
        title="Countdowns"
      >
        🗓️
      </button>
      
      <div className="container">
        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        
        {/* Countdown Section */}
        {showCountdowns && (
          <div className="countdown-manager">
            <h3>📅 Your Countdowns</h3>
            <p className="countdown-subtitle">These show on your TRMNL display</p>
            
            <div className="countdown-list">
              {countdownLoading ? (
                <p className="no-events">Loading countdowns...</p>
              ) : countdownEvents.length === 0 ? (
                <p className="no-events">No countdowns yet. Add one!</p>
              ) : (
                countdownEvents.map((event, index) => {
                  const days = getDaysUntil(event.date);
                  const isPast = days < 0;
                  
                  return (
                    <div key={index} className={`countdown-item ${isPast ? 'past' : ''}`}>
                      <span className="countdown-emoji">{event.emoji}</span>
                      <div className="countdown-info">
                        <span className="countdown-name">{event.name}</span>
                        <span className="countdown-date">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className={`countdown-days ${isPast ? 'past' : ''}`}>
                        {isPast ? 'Past' : `${days} days`}
                      </span>
                      <button 
                        className="countdown-delete"
                        onClick={() => deleteCountdownEvent(index)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {showCountdownForm ? (
              <div className="countdown-form">
                <div className="form-row">
                  <div className="emoji-picker">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-option ${newEvent.emoji === emoji ? 'selected' : ''}`}
                        onClick={() => setNewEvent({ ...newEvent, emoji })}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Event name (e.g., 'Christmas')"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    maxLength={30}
                    className="countdown-input"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="countdown-input"
                  />
                </div>
                <div className="form-buttons">
                  <button onClick={() => setShowCountdownForm(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button onClick={addCountdownEvent} className="btn-save" disabled={countdownSaving}>
                    {countdownSaving ? 'Saving...' : 'Add Countdown'}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="btn-add-countdown"
                onClick={() => setShowCountdownForm(true)}
              >
                + Add Countdown
              </button>
            )}
          </div>
        )}
        
        <div className="message-counter">
          💌 {loveMessages.length} {loveMessages.length === 1 ? 'message' : 'messages'}
        </div>
        <div>
          {loveMessages.map(({ id, message, timestamp }, index) => (
            <div
              key={id}
              className="love-message-container slide-in"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <p className="love-message">{message}</p>
              {hoveredIndex === index && (
                <div className="tooltip">{new Date(timestamp).toLocaleString()}</div>
              )}
            </div>
          ))}
        </div>
        <div className={`add-message-container ${shake ? 'shake' : ''}`}>
          <input
            className='love-ingy-input'
            type="text"
            placeholder="Add a new love message"
            value={newLoveMessage}
            onChange={(e) => setNewLoveMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className='love-ingy-button' onClick={handleAddLoveMessage}>
            {showSuccess ? '✓' : 'Add Love Message'}
          </button>
        </div>
      </div>
    </>
  );
};

export default LovesIngy;