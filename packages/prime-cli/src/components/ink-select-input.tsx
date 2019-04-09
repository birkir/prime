import { Box, Color, StdinContext } from 'ink';
import React from 'react';

const Indicator = ({ isSelected }: { isSelected: boolean }) => {
  return (
    <Box>
      <Color blue>{isSelected ? `❯ ` : '  '}</Color>
    </Box>
  );
};

const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ENTER = '\r';
const CTRL_C = '\x03';

const Item = ({ isSelected, label }: { isSelected: boolean; label: string }) => (
  <Color blue={isSelected}>{label}</Color>
);

interface State {
  selectedIndex: number;
}

export const SelectInput = (props: any) => (
  <StdinContext.Consumer>
    {({ stdin, setRawMode }) => <InkSelectInput stdin={stdin} setRawMode={setRawMode} {...props} />}
  </StdinContext.Consumer>
);

class InkSelectInput extends React.Component<any, State> {
  public state = {
    selectedIndex: 0,
  };

  public render() {
    const { items } = this.props;
    const { selectedIndex } = this.state;

    const slicedItems = items;

    return (
      <Box flexDirection="column">
        {slicedItems.map((item, index) => {
          const isSelected = index === selectedIndex;

          return (
            <Box key={item.value}>
              <Indicator isSelected={isSelected} />
              <Item {...item} isSelected={isSelected} />
            </Box>
          );
        })}
      </Box>
    );
  }

  public componentDidMount() {
    this.props.setRawMode(true);
    this.props.stdin.on('data', data => {
      const s = String(data);
      if (s === ARROW_UP) {
        this.setState({ selectedIndex: this.state.selectedIndex - 1 });
      } else if (s === ARROW_DOWN) {
        this.setState({ selectedIndex: this.state.selectedIndex + 1 });
      } else if (s === ENTER) {
        this.props.onSelect(this.props.items[this.state.selectedIndex]);
      } else if (s === CTRL_C) {
        this.props.onCancel();
      }
    });
  }
}
