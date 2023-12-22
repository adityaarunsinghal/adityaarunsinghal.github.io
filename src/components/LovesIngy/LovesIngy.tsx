import { ChangeEvent, Component } from 'react';
import './LovesIngy.css';
import { loveMessages } from './loveMessages';

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
    this.setState({ loveMessages: loveMessages });
  }


  handleAddLoveMessage = () => {
    const { newLoveMessage, loveMessages } = this.state;
    if (newLoveMessage.trim() !== '') {
      const newMessage: LoveMessage = {
        message: newLoveMessage,
        timestamp: new Date().toISOString(),
      };
      const newMessages = [...loveMessages, newMessage];
      this.setState({ loveMessages: newMessages, newLoveMessage: '' });
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
      <body className='love-ingy-body'>
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
      </body>
    );
  }
}

export default LovesIngy;