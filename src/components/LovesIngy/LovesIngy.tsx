import { useState, useEffect } from 'react';
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
      if (error.code === 'permission-denied') {
        alert('Access denied. You do not have permission to view these messages.');
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

  return (
    <>
      <div className='love-ingy-body'></div>
      <div className="container">
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
