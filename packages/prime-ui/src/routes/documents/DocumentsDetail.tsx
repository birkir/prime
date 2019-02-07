import {
  Alert,
  Button,
  Card,
  Dropdown,
  Icon,
  Layout,
  Menu,
  message,
  Popconfirm,
  Skeleton,
  Spin,
} from 'antd';
import { distanceInWordsToNow } from 'date-fns';
import { isObject } from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';
import React from 'react';
import { Link } from 'react-router-dom';
import { ContentReleasePicker } from '../../components/content-release-picker/ContentReleasePicker';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { ContentEntries } from '../../stores/contentEntries';
import { ContentTypes } from '../../stores/contentTypes';
import { ContentEntry } from '../../stores/models/ContentEntry';
import { ContentType } from '../../stores/models/ContentType';
import { Settings } from '../../stores/settings';
import { BaseDocumentForm, DocumentForm } from './components/document-form/DocumentForm';
import './DocumentDetail.less';

const { Content, Sider } = Layout;

interface IProps {
  match: any;
  history: any;
  location: any;
}

interface IOptions {
  type?: string;
  entryId?: string;
  locale?: string;
  release?: string;

  [key: string]: string | undefined;
}

@observer
export class DocumentsDetail extends React.Component<IProps> {
  public documentForm: BaseDocumentForm | null = null;

  public contentEntry: Instance<typeof ContentEntry> | null = null;
  public contentType: Instance<typeof ContentType> | undefined;
  public locale = Settings.masterLocale;

  @observable
  public options: IOptions = {};

  @observable
  public loading = {
    publish: false,
    document: false,
    save: false,
  };

  @observable
  public promptEnabled = true;

  @observable
  public pickContentRelease = false;

  public componentDidMount() {
    const { entryId, options } = this.props.match.params;
    const opts: IOptions = String(options || '')
      .split(';')
      .reduce((acc: { [key: string]: string }, item: string) => {
        const [key, value] = item.split(':');
        acc[key] = value;
        return acc;
      }, {});

    if (opts.locale) {
      this.locale = Settings.locales.find(({ id }) => id === opts.locale) || Settings.masterLocale;
    }

    if (entryId) {
      opts.entryId = entryId;
    }

    this.options = opts;

    this.load();

    document.addEventListener('keydown', this.onKeyDown, false);
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, false);
  }

  public async load() {
    const { options, locale } = this;

    if (options.type) {
      this.contentType = await ContentTypes.loadByName(options.type);

      if (this.contentType) {
        this.forceUpdate();
      }
    }

    if (this.documentForm) {
      this.documentForm.props.form.resetFields();
    }

    if (options.entryId) {
      const loadDocTimer = setTimeout(() => {
        this.loading.document = true;
      }, 125);
      this.contentEntry = await ContentEntries.loadById(
        options.entryId,
        locale.id,
        options.release
      );
      clearTimeout(loadDocTimer);
      if (this.contentEntry && !options.type) {
        this.contentType = await ContentTypes.loadById(this.contentEntry.schemaId);
        if (this.contentType) {
          this.options.type = this.contentType.name.toLocaleLowerCase();
        }
      }
      this.loading.document = false;
    }

    this.forceUpdate();
  }

  public opts(opts = {}) {
    const options = {
      ...this.options,
      ...opts,
    };
    delete options.entryId;
    return Object.entries(options)
      .filter(([key, value]) => value && value !== '')
      .map(kv => kv.join(':'))
      .join(';');
  }

  public save = ({
    releaseId,
    documentId,
    locale,
  }: { releaseId?: string; documentId?: string; locale?: string } = {}) =>
    new Promise((resolve, reject) => {
      if (this.documentForm) {
        const { form } = this.documentForm.props;
        form.validateFieldsAndScroll(async (err, values) => {
          if (err) {
            reject(err);
          } else {
            this.loading.save = true;
            form.setFieldsValue(values);
            const parse = (vals: any): any => {
              if (Array.isArray(vals)) {
                return vals.map(parse);
              }
              if (isObject(vals)) {
                return Object.entries(vals || {}).reduce((acc: any, [key, value]) => {
                  if (isObject(value)) {
                    const entries = Object.entries(value || {});
                    const indexes = entries.filter(([k]) => Number.isInteger(Number(k)));
                    const isArrayLike = indexes.length > 0;
                    if (isArrayLike) {
                      acc[key] = indexes.map(([k, v]) => parse(v));
                      return acc;
                    }
                  }
                  acc[key] = parse(value);
                  return acc;
                }, {});
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
              await this.contentEntry.update({ data: parsed, releaseId, locale });
              resolve();
            } else if (this.contentType) {
              try {
                this.contentEntry = await ContentEntries.create({
                  schemaId: this.contentType.id,
                  data: parsed,
                  locale: this.locale.id,
                  releaseId,
                  documentId,
                });
                if (this.contentEntry) {
                  this.props.history.replace(
                    `/documents/doc/${this.contentEntry.documentId}/${this.opts()}`
                  );
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            }
            if (this.documentForm) {
              this.documentForm.props.form.resetFields();
            }
            this.loading.save = false;
          }
        });
      }
    });

  public onKeyDown = (e: any) => {
    if (e.which === 83 && (e.ctrlKey || e.metaKey)) {
      return this.onSave(e);
    }
    return true;
  };

  public onSave = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      await this.save({ documentId: this.props.match.params.entryId });
      message.success('Document was saved', 1);
    } catch (err) {
      message.error('Could not save document');
      console.error(err); // tslint:disable-line no-console
    }
    return false;
  };

  public onPublish = async (e: any) => {
    if (this.contentEntry) {
      this.loading.publish = true;
      await this.contentEntry.publish();
      message.success('Document was published', 1);
      this.loading.publish = false;
    }
  };

  public onReleaseSelect = async (record: any) => {
    if (this.contentEntry) {
      try {
        await this.save({ releaseId: record.id });
        message.success('Document was added to release');
        this.props.history.replace(
          `/documents/doc/${this.contentEntry.documentId}/${this.opts({ release: record.id })}`
        );
      } catch (err) {
        message.error('Could not add document to release');
      }
    }
  };

  public onDuplicate = (e: any) => {
    this.contentEntry = null;
    try {
      this.save();
      message.success('Document was duplicated', 1);
    } catch (err) {
      message.error('Could not duplicate document');
    }
  };

  public onFormRef = (ref: BaseDocumentForm) => {
    this.documentForm = ref;
  };

  public onLocaleClick = (e: any) => {
    const { match, history } = this.props;
    const { params } = match;
    const locale = e.key;

    if (params.entryId) {
      history.push(`/documents/doc/${params.entryId}/${this.opts({ locale })}`);
    } else {
      history.push(`/documents/create/${this.opts({ locale })}`);
    }
  };

  public onPreviewPress = async (e: any) => {
    const index = Number(e.key || 0);
    const preview = Settings.previews[index];
    const url = encodeURIComponent(
      preview.hostname + preview.pathname + '?' + this.contentEntry!.id
    );
    window.open(Settings.coreUrl + '/auth/preview?' + url, '_prime');
  };

  public renderVersion = (version: any) => {
    const draftLabel =
      this.contentEntry && this.contentEntry.hasChanged ? 'Unsaved changes' : 'Draft';
    return (
      <Alert
        key={version.id}
        type={version.publishedAt ? 'info' : 'warning'}
        icon={version.publishedAt ? <Icon type="check-circle" /> : <Icon type="info-circle" />}
        message={version.publishedAt ? 'Published' : draftLabel}
        description={`${distanceInWordsToNow(version.updatedAt)} ago`}
        style={{ marginBottom: 16 }}
        banner
      />
    );
  };

  public renderStatus = () => {
    const contentEntry = this.contentEntry!;
    const lastPublished = contentEntry.versions.findIndex(v => v.publishedAt !== null);
    const lastDraft = contentEntry.versions.findIndex(v => v.publishedAt === null);

    return (
      <>
        {lastDraft >= 0 &&
          (lastPublished === -1 || lastDraft < lastPublished) &&
          this.renderVersion(contentEntry.versions[lastDraft])}
        {lastPublished >= 0 && this.renderVersion(contentEntry.versions[lastPublished])}
      </>
    );
  };

  get localesMenu() {
    return (
      <Menu onClick={this.onLocaleClick} selectedKeys={[this.locale.id]}>
        {Settings.locales.map(({ id, flag, name }) => (
          <Menu.Item key={id}>
            <span className={`flagstrap-icon flagstrap-${flag}`} style={{ marginRight: 8 }} />
            {name}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  public renderPreview(loading: boolean) {
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

    const menu = (
      <Menu onClick={this.onPreviewPress}>
        {Settings.previews.map(({ name }, index: number) => (
          <Menu.Item key={index}>{name}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button style={{ marginLeft: 16 }} disabled={loading} icon="eye" />
      </Dropdown>
    );
  }

  public render() {
    const { contentEntry, contentType, options } = this;

    const backUrl = `/documents/by/${this.opts({ type: null })}`;

    return (
      <Layout>
        <Toolbar>
          <div style={{ flex: 1, display: 'flex' }}>
            <Link to={backUrl} className="ant-btn-back">
              <Icon type="left" />
            </Link>
            {contentType && (
              <h3 style={{ margin: 0 }}>
                {contentType.title}
                <Spin spinning={this.loading.document} delay={500} style={{ marginLeft: 16 }} />
              </h3>
            )}
          </div>
          <Dropdown overlay={this.localesMenu} trigger={['click']}>
            <Button type="default">
              <span
                className={`flagstrap-icon flagstrap-${this.locale.flag}`}
                style={{ marginRight: 8 }}
              />
              {this.locale.name}
              <Icon type="down" />
            </Button>
          </Dropdown>
          <Button
            onClick={this.onSave}
            type="default"
            icon="save"
            disabled={this.loading.document || this.loading.publish}
            style={{ marginLeft: 16 }}
            loading={this.loading.save}
          >
            Save
          </Button>
          {!options.release && (
            <Button
              onClick={this.onPublish}
              type="primary"
              icon="cloud-upload"
              loading={this.loading.publish}
              disabled={this.loading.document}
              style={{ marginLeft: 16 }}
            >
              Publish
            </Button>
          )}
          {this.renderPreview(this.loading.document)}
        </Toolbar>
        <Layout>
          <Content style={{ height: 'calc(100vh - 64px)' }}>
            {!contentType && (
              <div className="prime-document">
                <div
                  style={{
                    width: 65,
                    height: 40,
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                    backgroundColor: 'white',
                  }}
                />
                <Card
                  bordered={false}
                  style={{ borderRadius: 3, borderTopLeftRadius: 0, marginBottom: 16 }}
                >
                  <Skeleton loading={true} />
                </Card>
              </div>
            )}
            {contentType && contentType.fields && (
              <DocumentForm
                wrappedComponentRef={this.onFormRef}
                promptEnabled={this.promptEnabled}
                onSave={this.onSave}
                entry={contentEntry}
                schema={contentType.fields}
              />
            )}
          </Content>
          <ContentReleasePicker
            onCancel={() => {
              this.pickContentRelease = false;
            }}
            onSelect={this.onReleaseSelect}
            visible={this.pickContentRelease}
          />
          <Sider width={320} theme="light">
            <div style={{ padding: 16, flex: 1 }}>
              {contentEntry && contentEntry.versions.length > 0 ? (
                this.renderStatus()
              ) : this.loading.document ? null : (
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
              {contentEntry && (
                <>
                  <pre style={{ fontSize: 13 }}>{contentEntry.id}</pre>
                </>
              )}
              {contentEntry && !options.release && (
                <Button
                  type="dashed"
                  style={{ marginBottom: 8 }}
                  block
                  onClick={() => (this.pickContentRelease = true)}
                >
                  Add to release
                </Button>
              )}
              {contentEntry && contentEntry.hasBeenPublished && (
                <Popconfirm
                  title="Are you sure?"
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                  onConfirm={async () => {
                    await contentEntry.unpublish();
                  }}
                >
                  <Button type="dashed" style={{ marginBottom: 8 }} block>
                    Unpublish
                  </Button>
                </Popconfirm>
              )}
              {contentEntry && (
                <Button onClick={this.onDuplicate} style={{ marginBottom: 8 }} block>
                  Duplicate
                </Button>
              )}
              {contentEntry && (
                <Popconfirm
                  title="Are you sure?"
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                  onConfirm={async () => {
                    await contentEntry.remove();
                    this.promptEnabled = false;
                    this.props.history.push(`/documents/by/${this.opts()}`);
                    message.success('Document was deleted');
                  }}
                >
                  <Button type="danger" block>
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </div>
          </Sider>
        </Layout>
      </Layout>
    );
  }
}
