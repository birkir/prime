import React from 'react';
import { Layout, Button, Icon, message, Skeleton, Card, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { observable } from 'mobx';
import { Instance } from 'mobx-state-tree';
import { observer } from 'mobx-react';
import { distanceInWordsToNow } from 'date-fns';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { ContentEntries } from '../../stores/contentEntries';
import { ContentTypes } from '../../stores/contentTypes';
import { ContentEntry } from '../../stores/models/ContentEntry';
import { DocumentForm, BaseDocumentForm } from './components/document-form/DocumentForm';
import { ContentType } from '../../stores/models/ContentType';

const { Content, Sider } = Layout;

interface IProps {
  match: any;
  history: any;
}

@observer
export class DocumentsDetail extends React.Component<IProps> {

  documentForm: BaseDocumentForm | null = null;
  contentEntry: Instance<typeof ContentEntry> | null = null;
  contentType: Instance<typeof ContentType> | null = null;

  @observable loading = false;
  @observable loaded = false;
  @observable error: Error | null = null;

  componentDidMount() {
    this.load();
  }

  async load() {
    await ContentTypes.loadAll();
    await Promise.all(
      ContentTypes.list
      .filter(n => n.isSlice)
      .map(item => item.loadSchema())
    );

    const { params } = this.props.match;

    if (params.entryId) {
      this.loadEntry(params.entryId);
    } else if (params.contentTypeId) {
      this.loadContentType(params.contentTypeId);
    }
  }

  async loadEntry(entryId: string) {
    this.loading = true;
    try {
      const contentEntry = await ContentEntries.loadById(entryId);
      const contentType = await ContentTypes.loadById(contentEntry.contentTypeId);
      await contentType.loadSchema();
      contentEntry.setContentType(contentType);
      this.contentEntry = contentEntry;
      this.contentType = contentType;
      this.loaded = true;
    } catch (err) {
      this.error = err;
      this.loaded = false;
      message.error('Failed to load', err.message);
      console.error(err);
    }
    this.loading = false;
  }

  async loadContentType(contentTypeId: string) {
    this.loading = true;
    try {
      const contentType = await ContentTypes.loadById(contentTypeId);
      await contentType.loadSchema();
      this.contentType = contentType;
      this.loaded = true;
    } catch (err) {
      this.error = err;
      this.loaded = false;
      message.error('Failed to load', err.message);
      console.error(err);
    }
    this.loading = false;
  }

  onSave = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (this.documentForm) {
      this.documentForm.props.form.validateFields();
      const values: any = this.documentForm.props.form.getFieldsValue();

      this.contentType!.schema.fields.forEach(field => {
        if (field.type === 'group' || field.type === 'slice') {
          if (values[field.name]) {
            values[field.name] = Object.entries(values[field.name] || {})
              .filter(n => n[0] === '0' || Number(n[0]) > 0)
              .map(n => n[1]);
          }
        }
      });

      // Update values
      if (this.contentEntry) {
        await this.contentEntry!.update(values as any);
        message.info('Document was saved');
      } else if (this.contentType) {
        try {
          const contentEntry = await ContentEntries.create(this.contentType.id, values);
          this.props.history.push(`/documents/doc/${contentEntry.entryId}`);
          message.success('Document created');
        } catch(err) {
          message.error('Could not create document');
          console.error(err);
        }
      }
    }
  }

  onPublish = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await this.contentEntry!.publish();
    message.success('Document was published');
  }

  onFormRef = (ref: BaseDocumentForm) => {
    this.documentForm = ref;
  }

  renderVersion = (version: any, index: number) => {
    const draftLabel = this.contentEntry && this.contentEntry.hasChanged ? 'Unsaved changes' : 'Draft';
    return (
      <Alert
        key={version.versionId}
        type={version.isPublished ? 'info' : 'warning'}
        message={version.isPublished ? 'Published' : draftLabel}
        description={`${distanceInWordsToNow(version.updatedAt)} ago`}
        style={{ marginBottom: 16 }}
        banner
      />
    );
  }

  render() {
    const loading = (!this.loaded || this.loading);
    const contentEntry = this.contentEntry!;
    const contentType = this.contentType!;

    return (
      <Layout>
        <Toolbar>
          <div style={{ flex: 1 }}>
            <Link to="/documents" style={{ color: '#aaa' }}>
              <Icon type="left" />
              Back
            </Link>
          </div>
          {!loading && (
            <>
              <Button onClick={this.onSave} type="default" style={{ marginRight: 16 }}>Save</Button>
              <Button onClick={this.onPublish} type="primary" disabled={!contentEntry || contentEntry.isPublished}>Publish</Button>
            </>
          )}
        </Toolbar>
        <Layout>
          <Content style={{ padding: 32, height: 'calc(100vh - 64px)' }}>
            {loading && (
              <Card style={{ marginTop: 100 }}>
                <Skeleton loading={true} />
              </Card>
            )}
            {!loading && (
              <DocumentForm
                wrappedComponentRef={this.onFormRef}
                onSave={this.onSave}
                entry={contentEntry}
                schema={contentType.schema}
              />
            )}
          </Content>
          <Sider
            width={320}
            theme="light"
          >
            <div style={{ padding: 32 }}>
              <h3>Versions</h3>
              {contentEntry ? contentEntry.versions.map(this.renderVersion) : (
                <Alert
                  type="warning"
                  message="Unsaved document"
                  style={{ marginBottom: 16 }}
                  banner
                />
              )}
            </div>
          </Sider>
        </Layout>
      </Layout>
    )
  }
}
