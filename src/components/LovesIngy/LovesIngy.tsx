import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './LovesIngy.css';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from '../../firebase';

interface LoveMessage {
  id: string;
  message: string;
  timestamp: string;
}

const LovesIngy = () => {
  const [loveMessages, setLoveMessages] = useState<LoveMessage[]>([]);
  const [newLoveMessage, setNewLoveMessage] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddLoveMessage = async () => {
    if (newLoveMessage.trim() !== '') {
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
        } catch (e) {
          // Not a JSON, proceed with original message
        }

        await addDoc(loveMessagesRef, messageData);
        setNewLoveMessage('');
      } catch (error: unknown) {
        console.error('Error adding message:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
          alert('Access denied. You do not have permission to add messages.');
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLoveMessage();
    }
  };

  const triggerHeartShower = () => {
    const heart = confetti.shapeFromText({ text: '💩', scalar: 2 });
    
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
    
    // Second wave
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

  return (
    <>
      <div className='love-ingy-body'></div>
      <button 
        className="heart-button"
        onClick={triggerHeartShower}
        title="💩"
      >
        💩
      </button>
      <div className="container">
        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        <div>
          {loveMessages.map(({ id, message, timestamp }, index) => (
            <div
              key={id}
              className="love-message-container"
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
        <div className="add-message-container">
          <input
            className='love-ingy-input'
            type="text"
            placeholder="Add a new love message"
            value={newLoveMessage}
            onChange={(e) => setNewLoveMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className='love-ingy-button' onClick={handleAddLoveMessage}>Add Love Message</button>
        </div>
      </div>
    </>
  );
};

export default LovesIngy;
