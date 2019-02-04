import { Button, Table } from 'antd';
import { Observer } from 'mobx-react';
import React from 'react';
import semver from 'semver';
import { Settings } from '../../stores/settings';

export const System = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  React.useEffect(() => {
    Settings.readVersion();
  }, []);

  const [selectedPackages, setSelectedPackages] = React.useState([] as string[]);

  const onUpdate = async () => {
    if (Settings.packages) {
      setIsLoading(true);
      try {
        await Settings.updateSystem(selectedPackages as any);
        alert('Packages have been updated. Please restart the server.');
        setSelectedPackages([]);
      } catch (err) {
        alert('Could not update packages');
      }
      setIsLoading(false);
    }
  };

  return (
    <Observer
      render={() => (
        <>
          <h3>System Information</h3>
          <Table
            columns={[
              {
                key: 'name',
                title: 'Package name',
                dataIndex: 'name',
              },
              {
                key: 'currentVersion',
                title: 'Current version',
                dataIndex: 'currentVersion',
              },
              {
                key: 'latestVersion',
                title: 'Latest version',
                dataIndex: 'latestVersion',
                render(value, { latestVersion, currentVersion }) {
                  const isUpdate =
                    latestVersion && currentVersion && semver.gt(latestVersion, currentVersion);
                  return <span style={{ fontStyle: isUpdate ? '' : 'italic' }}>{value}</span>;
                },
              },
            ]}
            loading={Settings.packages.length === 0}
            pagination={false}
            rowKey="name"
            rowSelection={{
              selectedRowKeys: selectedPackages,
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedPackages(selectedRowKeys as string[]);
              },
              getCheckboxProps: ({ name, latestVersion, currentVersion }) => ({
                disabled: !(
                  latestVersion &&
                  currentVersion &&
                  semver.gt(latestVersion, currentVersion)
                ),
                name,
              }),
            }}
            dataSource={Settings.packages}
            footer={() => (
              <Button
                loading={isLoading}
                onClick={onUpdate}
                disabled={selectedPackages.length === 0}
              >
                Update (beta)
              </Button>
            )}
          />
        </>
      )}
    />
  );
};
