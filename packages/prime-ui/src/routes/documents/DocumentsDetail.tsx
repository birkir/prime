import React from 'react';
import { Layout, Button, Icon, message, Skeleton, Card, Alert, Dropdown, Menu, Popover, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { observable } from 'mobx';
import { Instance } from 'mobx-state-tree';
import { observer } from 'mobx-react';
import { distanceInWordsToNow } from 'date-fns';
import { isObject } from 'lodash';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { ContentEntries } from '../../stores/contentEntries';
import { ContentTypes } from '../../stores/contentTypes';
import { ContentEntry } from '../../stores/models/ContentEntry';
import { DocumentForm, BaseDocumentForm } from './components/document-form/DocumentForm';
import { ContentReleases } from '../../stores/contentReleases';
import { ContentType } from '../../stores/models/ContentType';
import { Settings } from '../../stores/settings';
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
  locale = Settings.masterLocale;

  @observable promptEnabled = true;
  @observable loading = false;
  @observable loaded = false;
  @observable error: Error | null = null;
  @observable loadingReleases = false;
  @observable loadedReleases = false;

  componentDidMount() {
    const search = new URLSearchParams(window.location.search);
    this.locale = Settings.locales.find(({ id }) => id === search.get('locale')) || Settings.masterLocale;
    this.load();

    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, false);
  }

  componentWillReceiveProps(nextProps: any) {
    if (this.props.location.search !== nextProps.location.search) {
      const search = new URLSearchParams(nextProps.location.search)
      this.locale = Settings.locales.find(({ id }) => id === search.get('locale')) || Settings.masterLocale;
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
      const contentEntry = await ContentEntries.loadById(entryId, this.locale.id);
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

  onKeyDown = (e: any) => {
    if (e.which == 83 && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.onSave(e);
      return false;
    }
    return true;
  }

  onSave = (e: React.MouseEvent<HTMLElement>) => new Promise((resolve, reject) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (this.documentForm) {
      const { form } = this.documentForm.props;

      form.validateFieldsAndScroll(async (err, values) => {
        if (err) {
          message.error('Document has validation errors');
          reject(err);
        } else {
          const parse = (vals: any): any => {
            if (Array.isArray(vals)) {
              return vals.map(parse);
            }
            if (isObject(vals)) {
              return Object.entries(vals || {}).reduce(
                (acc: any, [key, value]) => {
                  if (isObject(value)) {
                    const entries = Object.entries(value || {});
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

          Object.entries(parsed).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              if (value[0].__index) {
                value.sort((a, b) => Number(a.__index) - Number(b.__index));
              }
            }
          });

          // Update values
          if (this.contentEntry) {
            await this.contentEntry!.update(parsed);
            form.resetFields();
            message.info('Document was saved');
          } else if (this.contentType) {
            try {
              const search = new URLSearchParams(window.location.search);
              const contentEntry = await ContentEntries.create(this.contentType.id, parsed, this.locale.id, search.get('release'));
              if (contentEntry) {
                await this.loadEntry(contentEntry.entryId);
                this.props.history.replace(`/documents/doc/${contentEntry.entryId}?${search}`);
              }
              message.success('Document created');
              resolve();
            } catch(err) {
              message.error('Could not create document');
              console.error(err);
            }
          }
        }
      });
    }
  });

  onPublish = async (e: any) => {
    if (this.contentEntry) {
      await this.contentEntry.publish();
      message.success('Document was published');
    }
  }

  onReleaseClick = async (e: any) => {
    if (this.contentEntry) {
      try {
        await this.contentEntry.release(e.key);
        message.success('Document was added to release');
        const search = new URLSearchParams(this.props.location.search);
        search.append('release', e.key);
        this.props.history.replace(`/documents/doc/${this.contentEntry.entryId}?${search}`);
      } catch (err) {
        message.error('Something went wrong');
      }
    }
  }

  onFormRef = (ref: BaseDocumentForm) => {
    this.documentForm = ref;
  }

  onLocaleClick = (e: any) => {
    const { match, history } = this.props;
    const { params } = match;

    if (params.entryId) {
      history.push(`/documents/doc/${params.entryId}?locale=${e.key}`);
    } else if (params.contentTypeId) {
      history.push(`/documents/create/${params.contentTypeId}?locale=${e.key}`);
    }
  }

  onPreviewPress = async (e: any) => {
    const index = Number(e.key || 0);
    const preview = Settings.previews[index];
    const url = encodeURIComponent(preview.hostname + preview.pathname + '?' + this.contentEntry!.versionId);
    window.open(Settings.coreUrl + '/auth/preview?' + url, '_prime');
  }

  renderVersion = (version: any) => {
    const draftLabel = this.contentEntry && this.contentEntry.hasChanged ? 'Unsaved changes' : 'Draft';
    return (
      <Alert
        key={version.versionId}
        type={version.isPublished ? 'info' : 'warning'}
        icon={version.isPublished ? <Icon type="check-circle" /> : <Icon type="info-circle" />}
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
        {(lastDraft >= 0 && (lastPublished === -1 || lastDraft < lastPublished)) && this.renderVersion(contentEntry.versions[lastDraft])}
        {lastPublished >= 0 && this.renderVersion(contentEntry.versions[lastPublished])}
      </>
    );
  }

  get localesMenu() {
    return (
      <Menu
        onClick={this.onLocaleClick}
        selectedKeys={[this.locale.id]}
      >
        {Settings.locales.map(({ id, flag, name }) => (
          <Menu.Item key={id}>
            <span className={`flagstrap-icon flagstrap-${flag}`} style={{ marginRight: 8 }} />
            {name}
          </Menu.Item>
        ))}
      </Menu>
    )
  }

  renderPreview(loading: boolean) {
    if (Settings.previews.length === 0) {
      return null;
    }

    if (Settings.previews.length === 1) {
      return (
        <Button
          onClick={this.onPreviewPress}
          style={{ marginLeft: 16 }}
          disabled={loading}
          icon="eye"
        />
      );
    }

    const menu = <Menu onClick={this.onPreviewPress}>
      {Settings.previews.map(({ name }, index: number) => (
        <Menu.Item key={index}>
          {name}
        </Menu.Item>
      ))}
    </Menu>

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button
          style={{ marginLeft: 16 }}
          disabled={loading}
          icon="eye"
        />
      </Dropdown>
    );
  }

  render() {
    const loading = (!this.loaded || this.loading);
    const contentEntry = this.contentEntry!;
    const contentType = this.contentType!;

    const { params } = this.props.match;
    const search = new URLSearchParams(this.props.location.search);
    const contentReleaseId = search.get('release');

    const backUrl = (() => {
      const qs = `?locale=${this.locale.id}`;

      if (contentReleaseId) {
        return `/documents/release/${contentReleaseId}${qs}`;
      } else if (params.contentTypeId) {
        return `/documents/schema/${params.contentTypeId}${qs}`;
      } else if (search.get('schema') && this.contentType) {
        return `/documents/schema/${this.contentType.id}${qs}`;
      }
      return `/documents/${qs}`;
    })();

    const contentReleasesMenu = (
      <Menu onClick={this.onReleaseClick}>
        {ContentReleases.list.map((contentRelease) => (
          <Menu.Item key={contentRelease.id}>{contentRelease.name}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Layout>
        <Toolbar>
          <div style={{ flex: 1, display: 'flex' }}>
            <Link to={backUrl} className="ant-btn-back">
              <Icon type="left" />
            </Link>
            {contentType && <h3 style={{ margin: 0 }}>{contentType.title}</h3>}
          </div>
          <Dropdown overlay={this.localesMenu} trigger={['click']}>
            <Button type="default">
              <span className={`flagstrap-icon flagstrap-${this.locale.flag}`} style={{ marginRight: 8 }} />
              {this.locale.name}
              <Icon type="down" />
            </Button>
          </Dropdown>
          <Button onClick={this.onSave} type="default" disabled={loading} style={{ marginLeft: 16 }}>Save</Button>
          <Button onClick={this.onPublish} type="primary" disabled={loading || !contentEntry || contentEntry.isPublished} style={{ marginLeft: 16 }}>Publish</Button>
          {this.renderPreview(loading)}
        </Toolbar>
        <Layout>
          <Content style={{ height: 'calc(100vh - 64px)' }}>
            {loading && (
              <div className="prime-document">
                <div style={{ width: 65, height: 40, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: 'white' }} />
                <Card bordered={false} style={{ borderRadius: 3, borderTopLeftRadius: 0, marginBottom: 16 }}>
                  <Skeleton loading={true} />
                </Card>
              </div>
            )}
            {!loading && (
              <DocumentForm
                wrappedComponentRef={this.onFormRef}
                promptEnabled={this.promptEnabled}
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
            <div style={{ padding: 16, flex: 1 }}>
              {contentEntry && contentEntry.versions.length > 0 ? this.renderStatus() : (
                <Alert
                  type="warning"
                  message="New document"
                  description="Unsaved changes"
                  style={{ marginBottom: 16 }}
                  banner
                />
              )}
            </div>
            <div style={{ padding: 16 }}>
              {contentEntry && !contentReleaseId && !contentEntry.isPublished && (
                <Dropdown
                  overlay={contentReleasesMenu}
                  trigger={['click']}
                  placement="topCenter"
                >
                  <Button
                    type="dashed"
                    style={{ marginBottom: 8 }}
                    block
                    loading={this.loadingReleases}
                    onClick={async () => {
                      this.loadingReleases = true;
                      await ContentReleases.loadAll();
                      setTimeout(() => {
                        this.loadingReleases = false;
                      }, 330);
                    }}
                  >
                    Add to release
                  </Button>
                </Dropdown>
              )}
              {contentEntry && contentEntry.isPublished && (
                <Popconfirm
                  title="Are you sure?"
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                  onConfirm={async () => {
                    await contentEntry.unpublish();
                  }}
                >
                  <Button type="dashed" style={{ marginBottom: 8 }} block>Unpublish</Button>
                </Popconfirm>
              )}
              {contentEntry && (
                <Popconfirm
                  title="Are you sure?"
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                  onConfirm={async () => {
                    await contentEntry.remove();
                    this.promptEnabled = false;
                    this.props.history.push('/documents');
                  }}
                >
                  <Button type="danger" block>Delete</Button>
                </Popconfirm>
              )}
            </div>
          </Sider>
        </Layout>
      </Layout>
    )
  }
}
