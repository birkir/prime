import React from 'react';
import { observer } from 'mobx-react';
import { Formik, Field } from 'formik';
import { Button, FormGroup, InputGroup, Spinner, Card, Dialog, Classes } from '@blueprintjs/core';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

import { ContentTypes } from '../../stores/contentTypes';

interface IForm {
  name: string;
  title: string;
  type: string;
  group: string;
}

const initialValues: IForm = {
  name: '',
  title: '',
  type: 'string',
  group: '',
};

@observer
export class ContentTypeDetail extends React.Component<{ match: { params: { id: string } } }> {

  state = {
    isOpen: false,
  }

  formik: React.RefObject<Formik<IForm, any>> = React.createRef();
  table: HTMLElement | undefined;

  get id() {
    const { params } = this.props.match;
    return params.id;
  }

  componentDidMount() {
    console.log(this.props);
    ContentTypes.fetchById(this.id);
  }

  onSubmit = async (values: any, actions: any) => {
    await ContentTypes.createContentType({
      contentTypeId: this.id,
      ...values
    });
    await ContentTypes.fetchById(this.id);
    actions.setSubmitting(false);
    actions.resetForm();
    this.setState({ isOpen: false });
  }

  onAddField = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    this.setState({ isOpen: true });
    return false;
  }

  onCancel = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    this.setState({ isOpen: false });
    if (this.formik.current) {
      this.formik.current.resetForm();
    }
    return false;
  }

  onDragEnd = ({ destination, draggableId }: any) => {
    const contentType = ContentTypes.items.get(this.id);
    if (contentType) {
      contentType.updatePositions(draggableId, destination.index);
    }
  }

  render() {
    const contentType = ContentTypes.items.get(this.id);

    if (!contentType) {
      return (
        <Spinner />
      );
    }

    return (
      <div style={{ maxWidth: 450 }}>
        <Card>
          <h2 className="bp3-heading">{contentType.name}</h2>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <table className="bp3-html-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Field Name</th>
                  <th>Field Type</th>
                  <th>Group</th>
                </tr>
              </thead>
              <Droppable droppableId="table">
                {(droppableProvided: DroppableProvided) => (
                  <tbody
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                  >
                    {contentType.fields.map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(
                          provided: DraggableProvided,
                        ) => (
                          <tr
                            key={field.id}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <td>{field.name}</td>
                            <td>{field.title}</td>
                            <td>{field.type}</td>
                            <td>{field.group ? field.group : <i className="bp3-text-muted">none</i>}</td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
          <Button onClick={this.onAddField}>Add field</Button>
        </Card>

        <Formik
          onSubmit={this.onSubmit}
          initialValues={initialValues}
          ref={this.formik}
        >
          {props => {
            const {
              values,
              isSubmitting,
              handleBlur,
              handleChange,
              handleSubmit,
            } = props;
            return (
              <Dialog
                title="Add Field"
                isOpen={this.state.isOpen}
                style={{ backgroundColor: 'white' }}
                onClose={() => this.setState({ isOpen: false })}
                transitionDuration={0}
              >
                <form onSubmit={handleSubmit}>
                  <div className={Classes.DIALOG_BODY}>
                    <FormGroup
                      label="API ID"
                      labelFor="ct_name"
                      labelInfo="(required)"
                    >
                      <InputGroup
                        id="ct_name"
                        name="name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.name}
                        autoFocus
                      />
                    </FormGroup>
                    <FormGroup
                      label="Field Name"
                      labelFor="ct_title"
                      labelInfo="(required)"
                    >
                      <InputGroup
                        id="ct_title"
                        name="title"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.title}
                      />
                    </FormGroup>
                    <FormGroup
                      label="Field Type"
                      labelFor="ct_type"
                      labelInfo="(required)"
                    >
                      <div className="bp3-select bp3-fill">
                        <Field component="select" name="type">
                          <option value="string">String</option>
                          <option value="number">Number</option>
                        </Field>
                      </div>
                    </FormGroup>
                    <FormGroup
                      label="Group"
                      labelFor="ct_group"
                    >
                      <InputGroup
                        id="ct_group"
                        name="group"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.group}
                      />
                    </FormGroup>
                  </div>
                  <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                      <Button className="bp3-intent-primary" type="submit" disabled={isSubmitting}>
                        Save
                      </Button>
                      <Button type="button" onClick={this.onCancel}>Cancel</Button>
                    </div>
                  </div>
                </form>
              </Dialog>
            );
          }}
        </Formik>
      </div>
    );
  }
}
