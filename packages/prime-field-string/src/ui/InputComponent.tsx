import React from 'react';

interface IProps {
  value: string;
}

export class InputComponent extends React.Component<IProps> {

  componentDidMount() {
    console.log('Component is mounted');
  }

  getValue() {
    return this.state.value;
  }

  state = {
    value: this.props.value,
  };

  onChange = (e: any) => {
    this.setState({
      value: e.currentTarget.value,
    });
  }

  render() {
    return (
      <div>
        <p>This is a sample field</p>
        <input
          type="text"
          value={this.state.value}
          onChange={this.onChange}
        />
      </div>
    )
  }
}
