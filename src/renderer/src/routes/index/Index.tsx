import { useEffect, useState } from 'react';
import { SetupStatus } from '@/types/status';
import SetupStep from '@/components/index/SetupStep';

export const Index = (): JSX.Element => {
  const [setupStatuses, setSetupStatuses] = useState<SetupStatus[]>([
    {
      status: 'running',
      stage: 'check-conda-installation',
      message: 'Making sure Conda is installed on this machine.'
    },
    {
      status: 'pending',
      stage: 'bootstrap-conda-env',
      message: 'Setup the Conda environment for Flojoy Studio.'
    },

    {
      status: 'pending',
      stage: 'install-dependencies',
      message: 'Install all the dependencies for Flojoy Studio.'
    },
    {
      status: 'pending',
      stage: 'starting-captain',
      message: 'Start the Flojoy Server.'
    }
  ]);

  const [selectedEnv, setSelectedEnv] = useState<string | undefined>(undefined);

  const checkCondaInstallation = async (): Promise<void> => {
    try {
      const data = await window.api.checkCondaInstallation();
      updateSetupStatus({
        stage: 'check-conda-installation',
        status: 'completed',
        message: `Conda ${data.split(' ')[1]} is installed!`
      });
    } catch (err) {
      updateSetupStatus({
        stage: 'bootstrap-conda-env',
        status: 'error',
        message: 'Conda is not installed on this machine!'
      });
    }
  };

  const bootstrapCondaEnv = async (): Promise<void> => {
    // We will first get all the envs
    // If the 'flojoy-studio' env exists then we are good
    // If not we will create the 'flojoy-studio' env

    const data = await window.api.getCondaEnvList();
    const parsed = JSON.parse(data);

    let flojoyCondaEnv: string | undefined = undefined;
    for (const env of parsed['envs']) {
      if (env.endsWith('flojoy-studio')) {
        flojoyCondaEnv = env;
      }
    }

    if (flojoyCondaEnv !== undefined) {
      updateSetupStatus({
        stage: 'bootstrap-conda-env',
        status: 'completed',
        message: 'Successfully bootstrapped the Conda environment!'
      });
    } else {
      const result = await window.api.createFlojoyStudioEnv();

      const parsedResult = JSON.parse(result);
      console.log(parsedResult);
      if (parsedResult['success'] === true) {
        updateSetupStatus({
          stage: 'bootstrap-conda-env',
          status: 'completed',
          message: 'Successfully bootstrapped the Conda environment!'
        });
      } else {
        updateSetupStatus({
          stage: 'bootstrap-conda-env',
          status: 'error',
          message: 'Something went wrong when bootsraping the Conda environment.'
        });
      }
    }

    setSelectedEnv(flojoyCondaEnv);
  };

  const startingCaptain = async (): Promise<void> => {
    await window.api.spawnCaptain(selectedEnv + '/bin/python', 'main.py');
  };

  const installDependencies = async (): Promise<void> => {
    await window.api.upgradePip();
    await window.api.installPoetry();
    await window.api.installDependencies();

    updateSetupStatus({
      stage: 'install-dependencies',
      status: 'completed',
      message: 'Successfully installed Flojoy Studio dependencies.'
    });
  };

  const updateSetupStatus = (setupStatus: SetupStatus): void => {
    setSetupStatuses((prev) => {
      return prev.map((status) => {
        if (status.stage === setupStatus.stage) {
          return {
            ...setupStatus
          };
        }
        return status;
      });
    });
  };

  useEffect(() => {
    // Kick off the setup process with this useEffect
    checkCondaInstallation();
  }, []);

  useEffect(() => {
    // The main logic for the setup process
    const hasError = setupStatuses.find((status) => status.status === 'error');
    const isRunning = setupStatuses.find((status) => status.status === 'running');
    if (hasError || isRunning) {
      // no need to trigger the next step if there is an error
      // or something is already running...
      return;
    }

    const nextStep = setupStatuses.find((status) => status.status === 'pending');
    switch (nextStep?.stage) {
      case 'bootstrap-conda-env': {
        updateSetupStatus({
          stage: 'bootstrap-conda-env',
          status: 'running',
          message: 'Bootstrapping the Conda environment... (This might take a couple minutes)'
        });
        bootstrapCondaEnv();
        break;
      }
      case 'install-dependencies': {
        updateSetupStatus({
          stage: 'install-dependencies',
          status: 'running',
          message: 'Installing dependencies... (This might take a couple minutes)'
        });
        installDependencies();
        break;
      }
      case 'starting-captain': {
        updateSetupStatus({
          stage: 'starting-captain',
          status: 'running',
          message: 'Staring the captain backend'
        });
        startingCaptain();
        break;
      }
    }
  }, [setupStatuses]);

  return (
    <div className="flex grow flex-col items-center p-4">
      <div className="py-4"></div>
      <div className="text-4xl font-bold">Welcome to Flojoy Studio!</div>
      <div className="py-1"></div>
      <div className="">
        We are excited to have you here, please give us some time to get everything ready :)
      </div>

      <div className="py-4"></div>

      <div className="w-1/2 rounded-xl bg-background p-4">
        {setupStatuses.map((status, idx) => (
          <SetupStep status={status.status} key={idx} message={status.message} />
        ))}
      </div>
    </div>
  );
};
