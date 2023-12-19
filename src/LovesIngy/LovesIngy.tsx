import { ChangeEvent, Component } from 'react';
import './LovesIngy.css';

interface State {
  loveMessages: string[];
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

  handleAddLoveMessage = () => {
    const { newLoveMessage, loveMessages } = this.state;
    if (newLoveMessage.trim() !== '') {
      const newMessages = [...loveMessages, newLoveMessage];
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
          {this.state.loveMessages.map((message, index) => (
            <div
              key={index}
              className="love-message-container"
              onMouseEnter={() => this.handleMouseEnter(index)}
              onMouseLeave={this.handleMouseLeave}
            >
              <p className="love-message">{message}</p>
              {this.state.hoveredIndex === index && (
                <div className="tooltip">{new Date().toLocaleString()}</div>
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