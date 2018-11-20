import React from 'react';
import { observer } from 'mobx-react';
import { Layout, Card, Drawer, Button, Popconfirm, Icon, Tabs, message } from 'antd';
import { DragDropContext, Droppable, Draggable, DragStart, DropResult } from 'react-beautiful-dnd';
import { get } from 'lodash';
import gql from 'graphql-tag';

import { ContentTypes } from '../../stores/contentTypes';
import { EditField } from './components/EditField';
import { client } from '../../utils/client';
import { Toolbar } from '../../components/toolbar/Toolbar';

const { Sider, Content } = Layout;
const { TabPane } = Tabs;

type IField = {
  id?: string;
  parentId?: string;
  isNew?: boolean;
  type: string;
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

type IAvailableField = {
  id: string;
  title: string;
  description: string;
}

const QUERY_ALL_FIELDS = gql`
  query {
    allFields {
      id
      title
      description
    }
  }
`;

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
  selectedField?: IField;
  isNewField: boolean;
  availableFields: IAvailableField[];
}

@observer
export class SchemaDetail extends React.Component<IProps> {

  editField: any = React.createRef();
  contentType: any;

  state: IState = {
    flush: false,
    groups: [],
    fields: [],
    drawerVisible: false,
    isNewField: false,
    availableFields: [],
  }

  componentDidMount() {
    this.loadSchema();
    this.loadFields();
  }

  async loadSchema() {
    const contentType = await ContentTypes.loadById(this.props.match.params.id);
    if (contentType) {
      this.contentType = contentType;
      await contentType.loadSchema();
      const schema = JSON.parse(contentType.schema);
      if (schema.length === 0) {
        schema.push({ title: 'Main', fields: [] });
      }
      this.updateSchema(schema);
      this.flushSchema();
    }
  }

  async loadFields() {
    const { data } = await client.query({
      query: QUERY_ALL_FIELDS,
    });

    this.setState({
      availableFields: (data as any).allFields,
    });
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
    this.setState({
      drawerVisible: false,
      isNewField: false,
    });
  }

  onDragStart = (e: DragStart) => {
    const { fields } = this.state;
    const { source, draggableId } = e;
    const [key, fieldId] = draggableId.split('.');

    if (source.droppableId === 'AvailableFields') {
      if (fieldId === 'Group') {
        this.mapFields((f: IField) => {
          if (f.type && f.type === 'group') {
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

    // Disable droppable on other group's
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
        name: '',
        title: '',
        disableDroppable: false,
        fields: [],
        type: fieldId,
      };

      this.mapFields((f: IField) => {
        if ((key === 'Field' && f.id === dropId) || (key === 'Group' && f.title === dropId)) {
          (f.fields || []).splice(destination.index, 0, newField);
        }
      });

      // Nested droppable groups behave badly
      // Only fix is to flush the schema
      if (fieldId === 'group') {
        this.flushSchema();
      }

      this.setState({
        isNewField: true,
        selectedField: newField,
      });

      this.onOpenDrawer();
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

  onFieldClick = (e: React.MouseEvent<HTMLElement>, field: IField) => {
    e.stopPropagation();
    const allowed = Array.from(
      e.currentTarget.querySelectorAll('.ant-card-head, .ant-card-head-wrapper, .ant-card-head-title')
    );
    const isAllowed = allowed.find(node => node === e.target);
    if (isAllowed) {

      this.setState({
        selectedField: field,
      });

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

  onEditFieldCancel = () => {
    const { selectedField, isNewField } = this.state;
    if (selectedField && isNewField) {
      this.removeField(selectedField);
    }
    this.onCloseDrawer();
  }

  onEditFieldSubmit = async (field: any) => {
    const isValid = await new Promise(resolve =>
      this.editField.current.validateFields((hasErrors: any) => {
        resolve(!hasErrors);
      }));

    if (isValid) {
      // Save field...
      this.mapFields((f: any) => {
        if (field.id == f.id) {
          f.name = field.name;
          f.title = field.title;
          f.type = field.type;
          f.options = JSON.parse(field.options);
        }
      });

      this.onCloseDrawer();
    } else {
      message.error('Fix errors before saving');
    }
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
            marginBottom: 16,
          }}
        >
          <Card
            title={<>
              {`${field.title || field.name}`}
            </>}
            hoverable
            extra={
              <>
                <span style={{ marginRight: 10, color: '#aaa', display: 'inline-block', border: '1px solid #eee', borderRadius: 4, fontSize: 12, fontWeight: 'normal', padding: '2px 4px' }}>
                  {field.type.substr(0, 1) + field.type.substr(1).toLowerCase()}
                </span>
                <Popconfirm
                  title="Are you sure?"
                  onConfirm={() => this.removeField(field)}
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                >
                  <Button size="small" type="dashed">
                    <Icon type="delete" />
                  </Button>
                </Popconfirm>
              </>
            }
            onClick={(e) => this.onFieldClick(e, field)}
            bodyStyle={{ display: field.type === 'group' ? 'inherit' : 'none' }}
          >
            {field.type === 'group' && this.renderGroupField(field)}
          </Card>
        </div>
      )}
    </Draggable>
  );

  renderAvailableField = (field: any, index: number) => (
    <Draggable
      key={`AvailableField.${field.id}`}
      draggableId={`AvailableField.${field.id}`}
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
            title={field.title}
            bodyStyle={{ display: 'none' }}
            hoverable
          />
        </div>
      )}
    </Draggable>
  );

  renderGroup = (group: any) => (
    <TabPane
      key={group.title}
      tab={group.title}
      closable={group.title !== 'Main'}
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

  render() {
    const { flush, groups, availableFields } = this.state;

    if (flush) {
      return null;
    }

    const title = get(this.contentType, 'title');

    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
        onDragStart={this.onDragStart}
      >
        <Layout style={{ minHeight: '100%' }}>
          <Toolbar>
            <div style={{ flex: 1 }}>
              <h3 style={{ padding: 0 }}>{title}</h3>
            </div>
            <Button type="primary" onClick={this.onSave}>Save</Button>
          </Toolbar>
          <Layout>
            <Content style={{ padding: 32 }}>
              <Tabs defaultActiveKey="1" size="small" type="editable-card">
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
          </Layout>
          <Drawer
            title="Edit field"
            width={300}
            placement="right"
            maskClosable={true}
            onClose={this.onEditFieldCancel}
            visible={this.state.drawerVisible}
          >
            <EditField
              ref={this.editField}
              availableFields={availableFields}
              field={this.state.selectedField}
              onCancel={this.onEditFieldCancel}
              onSubmit={this.onEditFieldSubmit}
            />
          </Drawer>
        </Layout>
      </DragDropContext>
    )
  }
}
