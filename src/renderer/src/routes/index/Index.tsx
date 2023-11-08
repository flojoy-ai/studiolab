import { useEffect, useState } from 'react';
import { SetupStatus } from '@/types/status';
import SetupStep from '@/components/index/SetupStep';

export const Index = (): JSX.Element => {
  const [setupStatuses, setSetupStatuses] = useState<SetupStatus[]>([
    {
      status: 'running',
      stage: 'check-python-installation',
      message: 'Making sure Python 3.11 is installed on this machine.'
    },
    {
      status: 'pending',
      stage: 'install-dependencies',
      message: 'Configure all the magic behind Flojoy Studio.'
    },
    {
      status: 'pending',
      stage: 'spawn-captain',
      message: 'Start the Flojoy Studio backend.'
    }
  ]);

  const [selectedEnv, setSelectedEnv] = useState<string | undefined>(undefined);

  const checkPythonInstallation = async (): Promise<void> => {
    try {
      const data = await window.api.checkPythonInstallation();
      updateSetupStatus({
        stage: 'check-python-installation',
        status: 'completed',
        message: `Python ${data.split(' ')[1]} is installed!`
      });
    } catch (err) {
      updateSetupStatus({
        stage: 'check-python-installation',
        status: 'error',
        message: 'Cannot find any Python 3.11 installation on this machine :('
      });
    }
  };

  const installDependencies = async (): Promise<void> => {
    await window.api.installPipx();
    await window.api.installPoetry();
    await window.api.installDependencies();

    const data = await window.api.getPoetryVenvExecutable();
    setSelectedEnv(data);

    updateSetupStatus({
      stage: 'install-dependencies',
      status: 'completed',
      message: 'Finished setting up all the magic behind Flojoy Studio.'
    });
  };

  const spawnCaptain = async (): Promise<void> => {
    await window.api.spawnCaptain(selectedEnv);
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
    checkPythonInstallation();
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
      case 'install-dependencies': {
        updateSetupStatus({
          stage: 'install-dependencies',
          status: 'running',
          message: 'Working hard to set everything up! This may take a while for the first time...'
        });
        installDependencies();
        break;
      }
      case 'spawn-captain': {
        updateSetupStatus({
          stage: 'spawn-captain',
          status: 'running',
          message: 'Almost there, starting Flojoy Studio...'
        });
        spawnCaptain();
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
