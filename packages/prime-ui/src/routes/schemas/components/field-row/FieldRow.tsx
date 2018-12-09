import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, Popconfirm, Button, Icon, Tooltip } from 'antd';
import { getParent } from 'mobx-state-tree';

interface IProps {
  field: any;
  index: number;
  children: React.ReactNode;
  onDelete(field: any): void;
  onClick(field: any): void;
  onDisplayClick?(field: any): void;
}

export class FieldRow extends React.Component<IProps> {

  onExtraClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  }

  onDelete = () => {
    return this.props.onDelete(this.props.field);
  }

  onClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    return this.props.onClick(this.props.field);
  }

  onDisplayClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (this.props.onDisplayClick) {
      return this.props.onDisplayClick(this.props.field);
    }
    return null;
  };

  render() {
    const { field, index, children } = this.props;
    const starDisabled = field.type !== 'string';

    return (
      <Draggable
        draggableId={`Field.${field.id}`}
        index={index}
        key={field.id}
      >
        {(draggableProvided) => (
          <div
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}
            {...draggableProvided.dragHandleProps}
            style={{
              ...draggableProvided.draggableProps.style,
              marginBottom: 16,
            }}
          >
            <Card
              title={<>
                {`${field.title || field.name}`}
              </>}
              hoverable
              extra={
                <span onClick={this.onExtraClick}>
                  <span style={{ marginRight: 10, color: '#aaa', display: 'inline-block', border: '1px solid #eee', borderRadius: 4, fontSize: 12, fontWeight: 'normal', padding: '2px 4px' }}>
                    {field.type.substr(0, 1) + field.type.substr(1).toLowerCase()}
                  </span>
                  {field.isLeaf && (
                    <Tooltip title="Mark as default for display">
                      <Button size="small" type="dashed" style={{ marginRight: 10 }} disabled={starDisabled} onClick={this.onDisplayClick}>
                        <Icon type="star" theme={field.isDisplay ? 'filled' : 'outlined'} />
                      </Button>
                    </Tooltip>
                  )}
                  <Popconfirm
                    title="Are you sure?"
                    onConfirm={this.onDelete}
                    icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                  >
                    <Button size="small" type="dashed">
                      <Icon type="delete" />
                    </Button>
                  </Popconfirm>
                </span>
              }
              onClick={this.onClick}
              bodyStyle={{ display: field.type === 'group' ? 'inherit' : 'none' }}
            >
              {children}
            </Card>
          </div>
        )}
      </Draggable>
    )
  }
}
