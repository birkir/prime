import { Button } from 'antd';
import { Observer } from 'mobx-react';
import React from 'react';
import semver from 'semver';
import { Settings } from '../../stores/settings';

export const System = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  React.useEffect(() => {
    Settings.readVersion();
  }, []);

  const onUpdate = async () => {
    if (Settings.latestVersion) {
      setIsLoading(true);
      await Settings.updateSystem(Settings.latestVersion);
      setIsLoading(false);
      alert('Prime has been updated. Please restart the server.');
    }
  };

  let isUpdateAvailable = false;

  if (Settings.latestVersion && Settings.version) {
    try {
      isUpdateAvailable = semver.gt(Settings.latestVersion, Settings.version);
    } catch (err) {
      // noop
    }
  }

  return (
    <Observer
      render={() => (
        <>
          <h3>System Information</h3>
          <div>
            <strong>Version</strong>: {Settings.version}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Latest</strong>: {Settings.latestVersion}
          </div>
          <Button loading={isLoading} onClick={onUpdate} disabled={!isUpdateAvailable}>
            {!isUpdateAvailable ? 'No update available' : 'Update (beta)'}
          </Button>
        </>
      )}
    />
  );
};
