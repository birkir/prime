import React from 'react';
import { observer } from 'mobx-react';
import { Layout, Card, Drawer, Button, Popconfirm, Icon, Tabs, message } from 'antd';
import { DragDropContext, Droppable, Draggable, DragStart, DropResult } from 'react-beautiful-dnd';
import { ContentTypes } from '../../stores/contentTypes';

type IFieldType = 'STRING' | 'NUMBER' | 'GROUP';

type IField = {
  id?: string;
  parentId?: string;
  isNew?: boolean;
  type: IFieldType;
  name: string;
  title: string;
  disableDroppable?: boolean;
  fields?: IField[];
  options?: any;
};

type IGroup = {
  title: string;
  disableDroppable?: boolean;
  fields?: IField[];
  body?: any;
};

const { Sider, Content } = Layout;
const { TabPane } = Tabs;

const arrMove = (arr: any[], oldIndex: number, newIndex: number) => {
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
}

const stripField = (field: any) => {
  if (field.isNew) {
    delete field.id;
  }
  delete field.disableDroppable;
  delete field.isNew;
  const fields = (field.fields || []).slice(0).map(stripField);
  if (fields.length > 0) {
    field.fields = fields;
  } else {
    delete field.fields;
  }
  delete field.__typename;
  return field;
};

const flattenGroupsFields = (groups: IGroup[]) => {
  return groups.slice(0).reduce((acc: IField[], group: IGroup) => {
    (group.fields || []).forEach((field: IField) => {
      acc.push(field);
      if (field.fields) {
        field.fields.forEach((f) => {
          acc.push({ ...f, parentId: field.id });
        });
      }
    });
    return acc;
  }, []);
}

const setFieldFlag = (groups: IGroup[], cb: Function) => {
  return groups.map((group: IGroup) => {
    cb(group);
    return {
      ...group,
      fields: (group.fields || []).map((field: IField) => {
        cb(field);
        return {
          ...field,
          fields: (field.fields || []).map((subfield: IField) => {
            cb(subfield);
            return subfield;
          }),
        };
      })
    }
  });
};

const availableFields = [{
  name: 'String',
  description: 'Text field with no formatting',
  type: 'STRING',
}, {
  name: 'Number',
  description: 'Floating point number field',
  type: 'NUMBER',
}, {
  name: 'Group',
  description: 'Group field can contain other fields',
  type: 'GROUP',
}];

interface IProps {
  match: {
    params: {
      id: string;
    }
  }
}

interface IState {
  flush: boolean;
  groups: IGroup[];
  fields: IField[];
  drawerVisible: boolean;
}

@observer
export class ContentTypeDetail extends React.Component<IProps> {

  componentDidMount() {
    this.loadSchema();
  }

  async loadSchema() {
    const contentType = await ContentTypes.loadById(this.props.match.params.id);
    if (contentType) {
      await contentType.loadSchema();
      const schema = JSON.parse(contentType.schema);
      if (schema.length === 0) {
        schema.push({ title: 'Main', fields: [] });
      }
      this.updateSchema(schema);
      this.flushSchema();
    }
  }

  async saveSchema(schema: IGroup[]) {
    const contentType = await ContentTypes.loadById(this.props.match.params.id);
    if (contentType) {
      const success = await contentType.saveSchema(schema);
      if (success) {
        message.success('Schema updated');
      }
    }
  }

  async updateSchema(schema: IGroup[]) {
    if (schema.length > 0) {
      this.setState({
        groups: schema,
        fields: flattenGroupsFields(schema),
      });
    }
  }

  flushSchema() {
    this.setState({ flush: true }, () => this.setState({ flush: false }));
  }

  mapFields = (fn: Function) => {
    const groups = setFieldFlag(this.state.groups, fn);
    this.updateSchema(groups);
  }

  state: IState = {
    flush: false,
    groups: [],
    fields: [],
    drawerVisible: false,
  }

  removeField = (field: IField) => {
    this.state.groups.forEach((g: IGroup) => {
      (g.fields || []).forEach((f: IField, i: number, a: IGroup[]) => {
        if (f.id === field.id) {
          a.splice(i, 1);
        }
        if (f.fields) {
          f.fields.forEach((f1: IField, i1: number, a1: IField[]) => {
            if (f1.id === field.id) {
              a1.splice(i1, 1);
            }
          });
        }
      });
    });
    this.updateSchema(this.state.groups);
  }

  onOpenDrawer = () => {
    this.setState({ drawerVisible: true });
  }

  onCloseDrawer = () => {
    this.setState({ drawerVisible: false });
  }

  onDragStart = (e: DragStart) => {
    const { fields } = this.state;
    const { source, draggableId } = e;
    const [key, fieldId] = draggableId.split('.');

    if (source.droppableId === 'AvailableFields') {
      if (fieldId === 'Group') {
        this.mapFields((f: IField) => {
          if (f.type && f.type === 'GROUP') {
            f.disableDroppable = true;
          }
        });
      }

      return;
    }

    const currentField = fields.find(({ id }) => id === fieldId);

    if (!currentField) {
      return null;
    }

    // Disable droppable on other GROUP's
    this.mapFields((f: IField) => {
      if (f.fields && f.id !== currentField.parentId) {
        f.disableDroppable = true;
      }
    });
  }

  onDragEnd = (e: DropResult) => {
    const { destination, source, draggableId } = e;
    const [draggableKey, fieldId] = draggableId.split('.');

    // Enable droppable on all fields
    this.mapFields((f: IField) => {
      f.disableDroppable = false;
    });

    if (!destination) {
      // Skip operation if no destination
      return null;
    }

    if (draggableKey === 'AvailableField') {
      // Handle dropping of a new field
      const [key, dropId] = destination.droppableId.split('.');
      const id = String(Math.floor(Math.random() * 100000));
      const newField: IField = {
        id,
        isNew: true,
        name: 'newField',
        title: 'New Field',
        disableDroppable: false,
        fields: [],
        type: fieldId as IFieldType,
      };

      this.mapFields((f: IField) => {
        if ((key === 'Field' && f.id === dropId) || (key === 'Group' && f.title === dropId)) {
          (f.fields || []).splice(destination.index, 0, newField);
        }
      });

      // Nested droppable groups behave badly
      // Only fix is to flush the schema
      if (fieldId === 'GROUP') {
        this.flushSchema();
      }
    } else {
      // Handle moving of a current field
      const [key, dropId] = destination.droppableId.split('.');
      this.mapFields((f: IField) => {
        if ((key === 'Field' && f.id === dropId) || (key === 'Group' && f.title === dropId)) {
          arrMove(f.fields || [], source.index, destination.index);
        }
      });
    }
  }

  onFieldClick = (e: React.MouseEvent<HTMLElement>) => {
    const allowed = Array.from(
      e.currentTarget.querySelectorAll('.ant-card-head, .ant-card-head-wrapper, .ant-card-head-title')
    );
    const isAllowed = allowed.find(node => node === e.target);
    if (isAllowed) {
      this.onOpenDrawer();
    }
  }

  onSave = () => {
    // Remove IDs and other stuff from schema
    const schema = this.state.groups
    .slice(0)
    .map((g: IGroup) => {
      return {
        title: g.title,
        fields: (g.fields || []).slice(0).map(stripField),
      };
    });

    this.saveSchema(schema);
  }

  renderGroupField = (field: IField) => (
    <Droppable
      droppableId={`Field.${field.id}`}
      isDropDisabled={field.disableDroppable}
    >
      {(droppableProvided) => (
        <div
          ref={droppableProvided.innerRef}
          style={{ minHeight: 80, backgroundColor: '#f9f9f9', padding: 16 }}
          {...droppableProvided.droppableProps}
        >
          {(field.fields || []).map(this.renderField)}
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );

  renderField = (field: any, index: number) => (
    <Draggable
      draggableId={`Field.${field.id}`}
      index={index}
      key={field.id}
    >
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
              <Popconfirm
                title="Are you sure?"
                onConfirm={() => this.removeField(field)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              >
                <Button size="small" type="dashed">Delete</Button>
              </Popconfirm>
            }
            onClick={this.onFieldClick}
            bodyStyle={{ display: field.type === 'GROUP' ? 'inherit' : 'none' }}
          >
            {field.type === 'GROUP' && this.renderGroupField(field)}
          </Card>
        </div>
      )}
    </Draggable>
  );

  renderAvailableField = (field: any, index: number) => (
    <Draggable
      key={`AvailableField.${field.type}`}
      draggableId={`AvailableField.${field.type}`}
      index={index}
    >
      {(draggableProvided, draggableSnapshot) => (
        <div
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
          {...draggableProvided.dragHandleProps}
          style={{ ...draggableProvided.draggableProps.style, marginBottom: 10 }}
        >
          <Card
            title={field.name}
            bodyStyle={{ display: 'none' }}
          />
        </div>
      )}
    </Draggable>
  );

  renderGroup = (group: any) => {
    return (
      <TabPane
        key={group.title}
        tab={group.title}
      >
        <Droppable
          droppableId={`Group.${group.title}`}
          isDropDisabled={group.disableDroppable}
        >
          {(droppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              style={{ minHeight: 80 }}
            >
              {group.fields.map(this.renderField)}
              {droppableProvided.placeholder}
              <div style={{ height: 100 }} />
            </div>
          )}
        </Droppable>
      </TabPane>
    );
  }

  render() {
    const { flush, groups } = this.state;

    if (flush) {
      return null;
    }

    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
        onDragStart={this.onDragStart}
      >
        <Layout style={{ minHeight: '100%' }}>
          <Content style={{ padding: 16 }}>
            <Button onClick={this.onSave}>Save</Button>
            <Tabs defaultActiveKey="1" size="large">
              {groups.map(this.renderGroup)}
            </Tabs>
          </Content>
          <Sider
            theme="light"
            width={300}
            trigger={null}
            collapsed={false}
            style={{ padding: 16 }}
          >
            <Droppable droppableId="AvailableFields" isDropDisabled>
              {(droppableProvided) => (
                <div ref={droppableProvided.innerRef}>
                  {availableFields.map(this.renderAvailableField)}
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
