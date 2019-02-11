import { spawn } from 'child_process';
import copyTemplateDir from 'copy-template-dir';
import fs from 'fs';
import { Box, Color, render } from 'ink';
import TextInput from 'ink-text-input';
import Static from 'ink/build/components/Static';
import { kebabCase } from 'lodash';
import path from 'path';
import React from 'react';
import { Spinner } from '../components/ink-spinner';

enum WizardState {
  PROJECT_NAME,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  INSTALL,
  ERROR,
  DONE,
}

interface Props {
  projectName?: string;
}

interface State {
  wizardState: WizardState;
  projectNameInvalid: boolean;
  projectName: string;
  postgresUsername: string;
  postgresPassword: string;
  postgresDatabase: string;
  installMessage: string;
}

export const initCommand = cli => {
  setInterval(() => null, 100);
  return render(<InitCommand projectName={cli.input[1]} />);
};

class InitCommand extends React.Component<Props, State> {
  public state = {
    wizardState: this.getInitialWizardState(),
    projectNameInvalid: false,
    projectName: this.props.projectName || '',
    postgresUsername: '',
    postgresPassword: '',
    postgresDatabase: '',
    installMessage: 'Installing...',
  };

  public getInitialWizardState() {
    if (String(this.props.projectName || '').trim() === '') {
      return WizardState.PROJECT_NAME;
    }

    return WizardState.POSTGRES_USERNAME;
  }

  public componentDidMount() {
    const ENTER = '\r';
    process.stdin.on('data', data => {
      const { wizardState, projectName } = this.state;
      const s = String(data);
      if (s === ENTER) {
        if (wizardState === WizardState.PROJECT_NAME) {
          const projectNameInvalid = projectName.trim() === '';
          this.setState({ projectNameInvalid });
          if (projectNameInvalid) {
            return;
          }
        }

        if (wizardState === WizardState.POSTGRES_USERNAME) {
          const value = this.state.postgresUsername;
          if (value.trim() === '') {
            this.setState({ postgresUsername: require('os').userInfo().username });
          }
        }

        if (wizardState === WizardState.POSTGRES_PASSWORD) {
          const value = this.state.postgresPassword;
          if (value.trim() === '') {
            this.setState({ postgresPassword: '' });
          }
        }

        if (wizardState === WizardState.POSTGRES_DATABASE) {
          const value = this.state.postgresDatabase;
          if (value.trim() === '') {
            this.setState({ postgresDatabase: 'prime' });
          }

          this.install();
        }

        this.setState({ wizardState: this.state.wizardState + 1 });
      }
    });
  }

  public install() {
    const { projectName, postgresUsername, postgresPassword, postgresDatabase } = this.state;

    const templateDir = path.join(__dirname, '..', 'template');
    const targetDir = path.join(process.cwd(), projectName);
    const vars = {
      projectName,
      projectNameKebabCase: kebabCase(projectName),
      connectionString: `postgresql://${postgresUsername}${
        postgresPassword ? `:${postgresPassword}` : ''
      }@localhost:5432/${postgresDatabase}`,
      randomSecret: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    };

    if (fs.existsSync(targetDir)) {
      throw new Error('Target dir exists');
    }

    this.setState({ installMessage: 'Copying template to project directory' });
    copyTemplateDir(templateDir, targetDir, vars, (err, createdFiles) => {
      if (err) {
        throw err;
      }
      this.setState({ installMessage: 'Installing dependencies' });

      const installer = spawn('yarn', ['install'], { cwd: targetDir, detached: true });

      installer.stdout.on('data', data => {
        this.setState({
          installMessage: data
            .toString()
            .trim()
            .split('\n')
            .pop(),
        });
      });

      installer.on('close', () => {
        this.setState({ wizardState: WizardState.DONE }, () => {
          process.exit();
        });
      });
    });
  }

  public renderStaticOrInput = (
    targetState,
    title,
    statePropertyName: string,
    passProps: any = {}
  ) => {
    const { wizardState } = this.state;

    if (wizardState === targetState) {
      return (
        <Box>
          <Box>{title}: </Box>
          <TextInput
            value={this.state[statePropertyName]}
            onChange={value => {
              this.setState({
                projectNameInvalid: false,
                [statePropertyName]: value,
              } as any);
            }}
            {...passProps}
          />
        </Box>
      );
    } else if (wizardState >= targetState) {
      let value = this.state[statePropertyName];
      if (!value || value === '') {
        value = (passProps && passProps.placeholder) || '';
      }
      if (passProps.mask) {
        value = passProps.mask.repeat(value.length);
      }
      return (
        <Static>
          <Box>
            {title}: <Color green>{value}</Color>
          </Box>
        </Static>
      );
    }

    return null;
  };

  public render() {
    if (this.state.wizardState === WizardState.DONE) {
      return (
        <Box marginTop={1} flexDirection="column">
          <Box>Installation complete!</Box>
          <Box marginTop={1}>To start Prime CMS</Box>
          <Box marginTop={1} marginLeft={4} flexDirection="column">
            <Box>
              <Color green>cd {this.state.projectName}</Color>
            </Box>
            <Box>
              <Color green>yarn start</Color>
            </Box>
          </Box>
          <Box marginTop={1}>
            Submit issue if you have any problems: https://github.com/birkir/prime/issues
          </Box>
        </Box>
      );
    }

    if (this.state.wizardState === WizardState.INSTALL) {
      return (
        <Box marginTop={1}>
          <Spinner type="dots12" yellow />
          <Box>
            {' '}
            <Color green>{this.state.installMessage}</Color>
          </Box>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Box>
          {this.renderStaticOrInput(WizardState.PROJECT_NAME, 'Project name', 'projectName')}
          {this.state.projectNameInvalid && <Color red>invalid</Color>}
        </Box>
        {this.renderStaticOrInput(
          WizardState.POSTGRES_USERNAME,
          'Postgres username',
          'postgresUsername',
          { placeholder: require('os').userInfo().username }
        )}
        {this.renderStaticOrInput(
          WizardState.POSTGRES_PASSWORD,
          'Postgres password',
          'postgresPassword',
          { mask: '*' }
        )}
        {this.renderStaticOrInput(
          WizardState.POSTGRES_DATABASE,
          'Postgres database',
          'postgresDatabase',
          { placeholder: 'prime' }
        )}
      </Box>
    );
  }
}
