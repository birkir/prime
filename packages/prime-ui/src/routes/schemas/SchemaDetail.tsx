import { Button, Card, Drawer, Icon, Layout, message, Spin, Tabs } from 'antd';
import { get } from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { clone, getParent, Instance, onPatch } from 'mobx-state-tree';
import React from 'react';
import { DragDropContext, Draggable, DragStart, Droppable, DropResult } from 'react-beautiful-dnd';
import { Prompt } from 'react-router';

import { Link } from 'react-router-dom';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { ContentTypes } from '../../stores/contentTypes';
import { ContentType } from '../../stores/models/ContentType';
import { DEFAULT_GROUP_TITLE } from '../../stores/models/Schema';
import { ALL_FIELDS } from '../../stores/queries';
import { client } from '../../utils/client';
import { EditField } from './components/EditField';
import { FieldRow } from './components/field-row/FieldRow';

const { Sider, Content } = Layout;
const { TabPane } = Tabs;

const highlightColor = '#FEFCDD';

interface IAvailableField {
  id: string;
  title: string;
  description: string;
}

interface IProps {
  match: {
    params: { id: string };
  };
}

interface IState {
  flush: boolean;
  disabledDroppables: string[];
}

@observer
export class SchemaDetail extends React.Component<IProps> {
  public disposeOnPatch: any;
  public tabs: any = React.createRef();
  public editField: any = React.createRef();
  public contentType?: Instance<typeof ContentType>;
  public state: IState = {
    flush: false,
    disabledDroppables: [],
  };

  @observable
  public isDrawerOpen = false;

  @observable
  public isNewField = false;

  @observable
  public availableFields: IAvailableField[] = [];

  @observable
  public selectedField: any = null;

  @observable
  public selectedGroup: any = DEFAULT_GROUP_TITLE;

  @observable
  public loading = false;

  @observable
  public saving = false;

  public componentDidMount() {
    this.load();
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, false);
  }

  public async load() {
    this.loading = true;
    this.contentType = clone(await ContentTypes.loadById(this.props.match.params.id));
    if (this.contentType) {
      this.selectedGroup = this.contentType.groups[0] || DEFAULT_GROUP_TITLE;
      const { data } = await client.query({ query: ALL_FIELDS });
      this.availableFields = (data as any).allFields;
      this.detectChanges();
    }
    this.loading = false;
  }

  public saveSchema = async () => {
    this.disposeOnPatch();
    this.saving = true;
    const success = await this.contentType!.saveSchema();
    if (success) {
      message.success('Schema updated');
    }
    this.contentType!.fields.setHasChanged(false);
    this.detectChanges();
    this.saving = false;
  };

  public detectChanges() {
    this.disposeOnPatch = onPatch(this.contentType!.fields, res => {
      this.contentType!.fields.setHasChanged(true);
    });
  }

  public flushSchema() {
    this.setState({ flush: true }, () => this.setState({ flush: false }));
  }

  public onKeyDown = (e: any) => {
    if (e.which === 83 && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.saveSchema();
      return false;
    }
    return true;
  };

  public onOpenDrawer = () => {
    this.isDrawerOpen = true;
  };

  public onCloseDrawer = () => {
    this.isDrawerOpen = false;
  };

  public onDragStart = (e: DragStart) => {
    const { fields } = this.contentType!.fields;

    // const { fields } = this.state;
    const { source, draggableId } = e;
    const [key, fieldId] = draggableId.split('.');

    // Allow drop on all Droppables
    const disabledDroppables: string[] = [];

    if (source.droppableId === 'AvailableFields') {
      // The Draggable is a new field!
      if (fieldId === 'group') {
        fields.forEach(f => {
          if (f.type && f.type === 'group') {
            disabledDroppables.push(`FieldGroup.${f.id}`);
          }
        });
      }
    } else {
      const movingField = fields.find(({ id }) => id === fieldId);
      if (!movingField) {
        return null;
      }

      const parentTree = getParent(movingField);
      const parentNode = getParent(parentTree);
      const parentNodeId = parentNode && (parentNode as any).id;

      if (parentNodeId) {
        // Disable current group
        disabledDroppables.push(`Group.${this.selectedGroup}`);
      }

      fields.forEach(f => {
        if (f.type === 'group' && f.id !== parentNodeId) {
          // Disable other fields
          disabledDroppables.push(`FieldGroup.${f.id}`);
        }
      });
    }

    this.setState({
      disabledDroppables,
    });
  };

  public onDragEnd = (e: DropResult) => {
    if (!this.contentType) {
      return;
    }

    const { destination, draggableId } = e;

    if (!destination) {
      // Skip operation if no destination
      return null;
    }

    const [draggableKey, fieldId] = draggableId.split('.');
    const [key, dropId] = destination.droppableId.split('.');

    if (draggableKey === 'AvailableField') {
      // Handle dropping of a new field
      const addedField = this.contentType.fields.add(
        {
          name: '',
          title: '',
          description: '',
          group: this.selectedGroup,
          type: fieldId,
        },
        destination.index,
        this.selectedGroup,
        key === 'Field' ? dropId : undefined
      );

      this.isNewField = true;
      this.selectedField = addedField;

      // Nested droppable groups behave badly
      // Only fix is to flush the schema
      if (fieldId === 'group') {
        this.flushSchema();
      }

      if (addedField) {
        this.onOpenDrawer();
      } else {
        message.error('Could not add field :(');
      }
    } else {
      // Handle moving of a current field
      this.contentType.fields.move(fieldId, destination.index);
    }
  };

  public onFieldDelete = (field: any) => {
    this.contentType!.fields.remove(field);
    this.flushSchema();
  };

  public onFieldClick = (field: any) => {
    this.isNewField = false;
    this.selectedField = field;
    this.onOpenDrawer();
  };

  public onFieldDisplay = (field: any) => {
    this.contentType!.fields.setDisplay(field);
    this.flushSchema();
  };

  public onSave = () => {
    this.saveSchema();
  };

  public onEditFieldCancel = () => {
    const { selectedField, isNewField } = this;
    if (selectedField && isNewField) {
      this.contentType!.fields.remove(selectedField);
    }
    this.onCloseDrawer();
  };

  public onEditFieldSubmit = async (field: any) => {
    const isValid = await new Promise(resolve =>
      this.editField.current.validateFields((hasErrors: any) => {
        resolve(!hasErrors);
      })
    );

    if (isValid) {
      this.selectedField.update({
        name: field.name,
        title: field.title,
        description: field.description,
        type: field.type,
        options: field.options,
      });
      this.selectedField = null;
      this.onCloseDrawer();
    } else {
      message.error('Fix errors before saving');
    }
  };

  public onTabsChange = (selectedGroup: string) => {
    this.selectedGroup = selectedGroup;
  };

  public onTabsEdit = (targetKey: any, action: string) => {
    if (action === 'add') {
      this.onGroupAdd();
    } else if (action === 'remove') {
      if (confirm('Are you sure?')) {
        this.contentType!.removeGroup(targetKey);
      }
    }
  };

  public onGroupAdd = () => {
    const title = prompt('Enter group name', '');
    if (title) {
      this.contentType!.addGroup(title);
    }
  };

  public renderGroupField = (field: any) => (
    <Droppable
      key={field.id}
      droppableId={`Field.${field.id}`}
      isDropDisabled={this.state.disabledDroppables.indexOf(`FieldGroup.${field.id}`) >= 0}
    >
      {(droppableProvided, droppableSnapshot) => (
        <div
          ref={droppableProvided.innerRef}
          style={{
            minHeight: 80,
            transition: 'background-color 0.3s ease-in-out',
            backgroundColor: droppableSnapshot.isDraggingOver
              ? highlightColor
              : 'rgba(0, 0, 0, 0.025)',
            padding: 16,
          }}
          {...droppableProvided.droppableProps}
        >
          {field.fields.map(this.renderField)}
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );

  public renderField = (field: any, index: number) => (
    <FieldRow
      key={field.id}
      field={field}
      index={index}
      onDisplayClick={this.onFieldDisplay}
      onClick={this.onFieldClick}
      onDelete={this.onFieldDelete}
    >
      {field.type === 'group' && this.renderGroupField(field)}
    </FieldRow>
  );

  public renderAvailableField = (field: any, index: number) => (
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
            style={{ borderStyle: 'dashed' }}
            bodyStyle={{
              padding: '8px 16px',
              fontSize: 14,
            }}
            hoverable
          >
            <div>
              <strong>{field.title}</strong>
            </div>
            <div style={{ color: '#999' }}>{field.description}</div>
          </Card>
        </div>
      )}
    </Draggable>
  );

  public renderGroup = (groupName: any) => {
    const group = this.contentType!.fields.groups.find(
      g => g.title.toLowerCase() === groupName.toLowerCase()
    );

    return (
      <TabPane
        key={groupName}
        tab={groupName}
        style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}
      >
        <Droppable
          key={groupName}
          droppableId={`Group.${groupName}`}
          isDropDisabled={this.state.disabledDroppables.indexOf(`Group.${groupName}`) >= 0}
        >
          {(droppableProvided, droppableSnapshot) => (
            <div
              ref={droppableProvided.innerRef}
              style={{
                minHeight: '100%',
                transition: 'background-color 0.3s ease-in-out',
                backgroundColor: droppableSnapshot.isDraggingOver ? highlightColor : '',
                padding: 32,
              }}
            >
              {group &&
                group.fields
                  .filter((n: any) => n.schemaId === this.contentType!.id)
                  .map(this.renderField)}
              {droppableProvided.placeholder}
              <div style={{ height: 80 }} />
            </div>
          )}
        </Droppable>
      </TabPane>
    );
  };

  public render() {
    const { contentType, availableFields } = this;
    const { flush } = this.state;
    const title = get(contentType, 'title');

    return (
      <Layout style={{ minHeight: '100%' }}>
        <Toolbar>
          <div style={{ flex: 1, display: 'flex' }}>
            <Link to="/schemas" className="ant-btn-back">
              <Icon type="left" />
            </Link>
            <h3 style={{ margin: 0 }}>
              {this.loading ? null : title}
              <Spin spinning={this.loading} delay={500} />
            </h3>
          </div>
          <Button
            type="dashed"
            disabled
            style={{ marginRight: 8 }}
            title="WIP"
            icon="cloud-download"
          >
            Import
          </Button>
          <Button type="primary" onClick={this.onSave} icon="save" loading={this.saving}>
            Save
          </Button>
        </Toolbar>
        <Layout>
          {contentType && !flush && (
            <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
              <Content>
                <Prompt
                  when={contentType.fields.hasChanged}
                  message="You have unsaved changes. Are you sure you want to leave?"
                />
                {contentType.groups && contentType.groups.map && (
                  <Tabs
                    className="tabs-schema"
                    defaultActiveKey={this.selectedGroup}
                    onEdit={this.onTabsEdit}
                    onChange={this.onTabsChange}
                    type="editable-card"
                    ref={this.tabs}
                  >
                    {contentType.groups.map(this.renderGroup)}
                  </Tabs>
                )}
              </Content>
              <Sider
                theme="light"
                width={300}
                trigger={null}
                collapsed={false}
                style={{ padding: 16, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}
              >
                <Droppable droppableId="AvailableFields" isDropDisabled>
                  {droppableProvided => (
                    <div ref={droppableProvided.innerRef}>
                      {availableFields.map(this.renderAvailableField)}
                      {droppableProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Sider>
            </DragDropContext>
          )}
        </Layout>
        {contentType && (
          <Drawer
            title={`${this.isNewField ? 'New' : 'Edit'} field`}
            width={360}
            placement="right"
            maskClosable={true}
            onClose={this.onEditFieldCancel}
            visible={this.isDrawerOpen}
          >
            {this.selectedField && (
              <EditField
                ref={this.editField}
                availableFields={availableFields}
                field={this.selectedField}
                schema={contentType.fields}
                onCancel={this.onEditFieldCancel}
                onSubmit={this.onEditFieldSubmit}
              />
            )}
          </Drawer>
        )}
      </Layout>
    );
  }
}
