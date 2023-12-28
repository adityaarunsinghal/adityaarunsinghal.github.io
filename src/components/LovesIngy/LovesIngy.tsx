import { ChangeEvent, Component } from 'react';
import './LovesIngy.css';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore";
import { firebaseapp } from '../../firebase';

interface LoveMessage {
  message: string;
  timestamp: string;
}

interface State {
  loveMessages: LoveMessage[];
  newLoveMessage: string;
  hoveredIndex: number | null;
}

class LovesIngy extends Component<Record<string, never>, State> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      loveMessages: [],
      newLoveMessage: '',
      hoveredIndex: null,
    };
  }

  componentDidMount() {
    const db = getFirestore(firebaseapp);
    const loveMessagesRef = collection(db, 'love-ingy-messages');
    const queryOrderByTimestamp = query(loveMessagesRef, orderBy('timestamp', 'desc'));
    onSnapshot(queryOrderByTimestamp, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message,
          timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
        };
      });
      this.setState({ loveMessages: messages });
    });
  }

  handleAddLoveMessage = async () => {
    const { newLoveMessage } = this.state;
    if (newLoveMessage.trim() !== '') {
      const db = getFirestore(firebaseapp);
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
      this.setState({ newLoveMessage: '' });
    }
  };
  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ newLoveMessage: e.target.value });
  };

  handleMouseEnter = (index: number) => {
    this.setState({ hoveredIndex: index });
  };

  handleMouseLeave = () => {
    this.setState({ hoveredIndex: null });
  };

  handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.handleAddLoveMessage();
    }
  };

  render() {
    return (
      <>
        <div className='love-ingy-body'></div> {/* Background */}
        <div className="container">
          <div>
            {this.state.loveMessages.map(({ message, timestamp }, index) => (
              <div
                key={index}
                className="love-message-container"
                onMouseEnter={() => this.handleMouseEnter(index)}
                onMouseLeave={this.handleMouseLeave}
              >
                <p className="love-message">{message}</p>
                {this.state.hoveredIndex === index && (
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
              value={this.state.newLoveMessage}
              onChange={this.handleInputChange}
              onKeyPress={this.handleKeyPress}
            />
            <button className='love-ingy-button' onClick={this.handleAddLoveMessage}>Add Love Message</button>
          </div>
        </div>
      </>
    );
  }
}

export default LovesIngy;
