import React from 'react';
import { Layout, Button, Icon, message, Skeleton, Card, Alert, Dropdown, Menu } from 'antd';
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
import './DocumentDetail.less';

const { Content, Sider } = Layout;

interface IProps {
  match: any;
  history: any;
  location: any;
}

@observer
export class DocumentsDetail extends React.Component<IProps> {

  documentForm: BaseDocumentForm | null = null;
  contentEntry: Instance<typeof ContentEntry> | null = null;
  contentType: Instance<typeof ContentType> | undefined;

  langs = [{ id: 'en', flag: 'us', name: 'English' }, { id: 'is', flag: 'is', name: 'Icelandic' }];
  language: { id: string; flag: string; name: string } = this.langs[0];

  @observable loading = false;
  @observable loaded = false;
  @observable error: Error | null = null;

  componentDidMount() {
    const search = new URLSearchParams(window.location.search)
    this.language = this.langs.find(l => l.id === search.get('lang')) || this.langs[0];
    this.load();
  }

  componentWillReceiveProps(nextProps: any) {
    if (this.props.location.search !== nextProps.location.search) {
      const search = new URLSearchParams(nextProps.location.search)
      this.language = this.langs.find(l => l.id === search.get('lang')) || this.langs[0];
      this.loaded = false;
      this.load();
    }
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
      const contentEntry = await ContentEntries.loadById(entryId, this.language.id);
      const contentType = await ContentTypes.loadById(contentEntry.contentTypeId);
      if (contentType) {
        await contentType.loadSchema();
        contentEntry.setContentType(contentType);
      }
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
      if (contentType) {
        await contentType.loadSchema();
      }
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

      const parse = (vals: any): any => {
        if (Array.isArray(vals)) {
          return vals.map(parse);
        }
        if (typeof vals === 'object') {
          return Object.entries(vals || {}).reduce(
            (acc: any, [key, value]) => {
              if (typeof value === 'object') {
                const entries = Object.entries(value);
                const indexes = entries.filter(([k]) => Number.isInteger(Number(k)));
                const isArrayLike = (indexes.length > 0);
                if (isArrayLike) {
                  acc[key] = indexes.map(([k, v]) => parse(v));
                  return acc;
                }
              }
              acc[key] = parse(value);
              return acc;
            },
            {}
          );
        }
        return vals;
      };

      const parsed = parse(values);

      // Update values
      if (this.contentEntry) {
        await this.contentEntry!.update(parsed);
        message.info('Document was saved');
      } else if (this.contentType) {
        try {
          const contentEntry = await ContentEntries.create(this.contentType.id, parsed, this.language.id);
          if (contentEntry) {
            this.props.history.push(`/documents/doc/${contentEntry.entryId}?lang=${this.language.id}`);
          }
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

  onLanguageClick = (e: any) => {
    const { match, history } = this.props;
    const { params } = match;

    if (params.entryId) {
      history.push(`/documents/doc/${params.entryId}?lang=${e.key}`);
    } else if (params.contentTypeId) {
      history.push(`/documents/create/${params.contentTypeId}?lang=${e.key}`);
    }
  }

  renderVersion = (version: any) => {
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

  renderStatus = () => {
    const contentEntry = this.contentEntry!;
    const lastPublished = contentEntry.versions.findIndex(v => v.isPublished);
    const lastDraft = contentEntry.versions.findIndex(v => !v.isPublished);

    return (
      <>
        {(lastDraft >= 0 && lastDraft < lastPublished) && this.renderVersion(contentEntry.versions[lastDraft])}
        {lastPublished >= 0 && this.renderVersion(contentEntry.versions[lastPublished])}
      </>
    );
  }

  get languagesMenu() {
    return (
      <Menu
        onClick={this.onLanguageClick}
        selectedKeys={[this.language.id]}
      >
        {this.langs.map(({ id, flag, name }) => (
          <Menu.Item key={id}>
            <span className={`flag-icon flag-icon-${flag}`} style={{ marginRight: 8 }} />
            {name}
          </Menu.Item>
        ))}
      </Menu>
    )
  }

  render() {
    const loading = (!this.loaded || this.loading);
    const contentEntry = this.contentEntry!;
    const contentType = this.contentType!;

    return (
      <Layout>
        <Toolbar>
          <div style={{ flex: 1, display: 'flex' }}>
            <Link to={`/documents?lang=${this.language.id}`} className="ant-btn-back">
              <Icon type="left" />
            </Link>
            {contentType && <h3 style={{ margin: 0 }}>{contentType.title}</h3>}
          </div>
          <Dropdown overlay={this.languagesMenu} trigger={['click']}>
            <Button type="default" style={{ marginRight: 16 }}>
              <span className={`flag-icon flag-icon-${this.language.flag}`} style={{ marginRight: 8 }} />
              {this.language.name}
              <Icon type="down" />
            </Button>
          </Dropdown>
          {!loading && (
            <>
              <Button onClick={this.onSave} type="default" style={{ marginRight: 16 }}>Save</Button>
              <Button onClick={this.onPublish} type="primary" disabled={!contentEntry || contentEntry.isPublished}>Publish</Button>
            </>
          )}
        </Toolbar>
        <Layout>
          <Content style={{ height: 'calc(100vh - 64px)' }}>
            {loading && (
              <div className="prime-document">
                <div style={{ width: 65, height: 40, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: 'white' }} />
                <Card bordered={false} style={{ borderRadius: 3, borderTopLeftRadius: 0, marginBottom: 16 }}>
                  <Skeleton loading={true} />
                </Card>
                {/* <Card bordered={false} style={{ borderRadius: 3 }}>
                  <Skeleton loading={true} />
                </Card> */}
              </div>
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
            <div style={{ padding: 16 }}>
              {contentEntry && contentEntry.versions.length > 0 ? this.renderStatus() : (
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
