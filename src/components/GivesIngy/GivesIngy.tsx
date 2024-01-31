import { Component } from 'react';
import './GivesIngy.css';

class GivesIngy extends Component<unknown> {
  constructor(props: Record<string, never>) {
    super(props);
  }

  render() {
    return (
      <>
        <div className='give-ingy-body'></div> {/* Background */}
        <div className="container">
          <form
            action="https://formspree.io/f/xbjngrzo"
            method="POST"
          >
            <label>
              <p>
                Request Month:
              </p>
              <input className="give-ingy-input" type="text" name="month" required />
            </label>
            <label>
              <p>
                Today's date:
              </p>
              <input className="give-ingy-input date" type="date" name="selectedDate" />
            </label>
            <label>
              <p>
                What would you like?
              </p>
              <input className="give-ingy-input" type="text" name="item" required />
            </label>
            <label>
              <p>
                Link to Item?
              </p>
              <input className="give-ingy-input" type="text" name="link" />
            </label>
            <label>
              <p>
                Estimated $Amount?
              </p>
              <input className="give-ingy-input" type="text" name="amount" />
            </label>
            <button className="give-ingy-button" type="submit">Send</button>
          </form>
        </div>
      </>
    );
  }
}

export default GivesIngy;
