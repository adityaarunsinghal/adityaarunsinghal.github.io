import { ChangeEvent, Component } from 'react';
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

  render() {
    return (
      <div>
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
        <div>
          <input
            type="text"
            placeholder="Add a new love message"
            value={this.state.newLoveMessage}
            onChange={this.handleInputChange}
          />
          <button onClick={this.handleAddLoveMessage}>Add Love Message</button>
        </div>
      </div>
    );
  }
}

export default LovesIngy;