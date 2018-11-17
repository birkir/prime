import React from 'react';
import { observer } from 'mobx-react';
import { Layout, Card, Drawer, Button, Popconfirm, Icon } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
const { Sider, Content } = Layout;


const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  userSelect: 'none',
  marginBottom: 10,
  background: isDragging ? 'lightgreen' : 'pink',
  ...draggableStyle,
});

function array_move(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
}

const genId = () => Math.floor(Math.random() * 10000);

@observer
export class ContentTypeDetail extends React.Component {

  componentDidMount() {
    this.load();
  }

  async load() {
    // const contentType = await ContentTypes.loadById(this.props.match.id);
  }

  state = {
    flush: false,
    fields: [
      { name: 'Hello', type: 'string', id: genId() },
      { name: 'World', type: 'string', id: genId() },
      { name: 'Foo', type: 'group', id: genId(), fields: [
        { name: 'Test 1', type: 'string', id: genId() },
        { name: 'Test 2', type: 'string', id: genId() },
      ]},
    ],
    disableGroups: false,
    disableFields: false,
    drawerVisible: false,
  }

  removeField = (field: any) => {
    const fields = this.state.fields.slice(0);
    fields.forEach((f, index) => {
      if (f.id === field.id) {
        fields.splice(index, 1);
      }
      if (f.fields) {
        f.fields.forEach((f1, index1, arr) => {
          if (f1.id === field.id) {
            arr.splice(index1, 1);
          }
        });
      }
    });

    this.setState({ fields });
  }

  onOpenDrawer = () => {
    this.setState({ drawerVisible: true });
  }

  onCloseDrawer = () => {
    this.setState({ drawerVisible: false });
  }

  onDragStart = (e: any) => {
    const field = this.state.fields.find(field => String(field.id) === e.draggableId.replace('field-', ''));
    console.log(e);
    if (e.source.droppableId === 'fields') {
      if (field) {
        this.setState({ disableGroups: true });
      }
    } else if (e.source.droppableId !== 'availableFields') {
      if (!field) {
        this.setState({ disableFields: true });
      }
    } else if (e.draggableId === 'type-group') {
      this.setState({ disableGroups: true });
    }
  }

  onDragEnd = (e: any) => {

    const fields = this.state.fields.slice();

    if (!e.destination || !e.destination.droppableId) return;

    if (e.destination.droppableId !== 'fields') {
      const idx = fields.findIndex(field => String(field.id) === e.destination.droppableId.replace('fields-', ''));
      if (e.source.droppableId === e.destination.droppableId) {
        array_move(fields[idx].fields!, e.source.index, e.destination.index);
      } else if (String(e.draggableId || '').indexOf('type') >= 0) {
        fields[idx].fields!.splice(e.destination.index, 0, {
          name: 'Cool ' + Math.random(),
          type: e.draggableId.replace('type-', ''),
          id: genId(),
        });
      }
      this.setState({ fields, disableGroups: false, disableFields: false });
      return;
    }

    if (e.source.droppableId === e.destination.droppableId) {
      array_move(fields, e.source.index, e.destination.index);
    } else if (String(e.draggableId || '').indexOf('type') >= 0) {
      fields.splice(e.destination.index, 0, {
        name: 'Cool ' + Math.random(),
        type: e.draggableId.replace('type-', ''),
        id: genId(),
        fields: [],
      });
    }

    this.setState({ flush: true, fields, disableGroups: false, disableFields: false }, () => this.setState({ flush: false }));
  }

  onFieldClick = (e: any) => {
    const allowed = Array.from(e.currentTarget.querySelectorAll('.ant-card-head, .ant-card-head-wrapper, .ant-card-head-title'));
    const isAllowed = allowed.find(node => node === e.target);
    if (isAllowed) {
      this.onOpenDrawer();
    }
  }

  renderGroupField = (field: any) => (
    <>
      <br />
      <Droppable
        droppableId={`fields-${field.id}`}
        isDropDisabled={this.state.disableGroups}
      >
        {(droppableProvided, droppableSnapshot) => (
          <div
            ref={droppableProvided.innerRef}
            style={{ minHeight: 80, backgroundColor: '#f9f9f9', padding: 16 }}
            {...droppableProvided.droppableProps}
          >
            {field.fields.map(this.renderField)}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );

  renderField = (field: any, index: number) => (
    <Draggable draggableId={`field-${field.id}`} index={index} key={field.id}>
      {(draggableProvided, draggableSnapshot) => (
        <div
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
          {...draggableProvided.dragHandleProps}
          style={{
            ...draggableProvided.draggableProps.style,
            marginBottom: 10,
          }}
        >
          <Card
            title={`${field.name}: ${field.type}`}
            extra={
              <Popconfirm title="Are you sure?" onConfirm={() => this.removeField(field)} icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <Button size="small" type="dashed">Delete</Button>
              </Popconfirm>
            }
            onClick={this.onFieldClick}
            bodyStyle={{ display: field.type === 'group' ? 'inherit' : 'none' }}
          >
            {field.type === 'group' && this.renderGroupField(field)}
          </Card>
        </div>
      )}
    </Draggable>
  );

  render() {
    if (this.state.flush) {
      return null;
    }
    return (
      <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
        <Layout style={{ minHeight: '100%' }}>
          <Content style={{ padding: 16 }}>
            <h1>List of added fields</h1>
            <Droppable droppableId="fields" isDropDisabled={this.state.disableFields}>
              {(droppableProvided, droppableSnapshot) => (
                <div ref={droppableProvided.innerRef}>
                  {this.state.fields.map(this.renderField)}
                  {droppableProvided.placeholder}
                  <div style={{ height: 100 }} />
                </div>
              )}
            </Droppable>
          </Content>
          <Sider
            theme="light"
            width={300}
            trigger={null}
            collapsed={false}
            style={{ padding: 16 }}
          >
            <Droppable droppableId="availableFields" isDropDisabled>
              {(droppableProvided, droppableSnapshot) => (
                <div ref={droppableProvided.innerRef}>
                  <Draggable draggableId="type-string" index={0}>
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        style={{ ...draggableProvided.draggableProps.style, marginBottom: 10 }}
                      >
                        <Card style={{ boxShadow: draggableSnapshot.isDragging ? '0 0 5px rgba(0, 0, 0, 0.15)' : 'none' }}>
                          <h4>String field</h4>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                  <Draggable draggableId="type-number" index={1}>
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        style={{ ...draggableProvided.draggableProps.style, marginBottom: 10 }}
                      >
                        <Card style={{ boxShadow: draggableSnapshot.isDragging ? '0 0 5px rgba(0, 0, 0, 0.15)' : 'none' }}>
                          <h4>Number field</h4>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                  <Draggable draggableId="type-document" index={2}>
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        style={{ ...draggableProvided.draggableProps.style, marginBottom: 10 }}
                      >
                        <Card style={{ boxShadow: draggableSnapshot.isDragging ? '0 0 5px rgba(0, 0, 0, 0.15)' : 'none' }}>
                          <h4>Document</h4>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                  <Draggable draggableId="type-group" index={2}>
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        style={{ ...draggableProvided.draggableProps.style, marginBottom: 10 }}
                      >
                        <Card style={{ boxShadow: draggableSnapshot.isDragging ? '0 0 5px rgba(0, 0, 0, 0.15)' : 'none' }}>
                          <h4>Group</h4>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </Sider>
          <Drawer
            title="Edit field"
            width={300}
            placement="right"
            maskClosable={true}
            onClose={this.onCloseDrawer}
            visible={this.state.drawerVisible}
          >
            Edit field
          </Drawer>
        </Layout>
      </DragDropContext>
    )
  }
}
