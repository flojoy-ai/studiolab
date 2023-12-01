import { useEffect, useState } from 'react';
import { SetupStatus } from '@/types/status';
// import SetupStep from '@/components/index/SetupStep';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/AlertDialog';
// import { Button } from '@/components/ui/Button';
import { useLifecycleStore } from '@/stores/lifecycle';
import { isPackaged } from '@/utils/build';
import { trpcClient } from '@/main';
import { Progress } from '@/components/ui/Progress';
import logo from '../../../../../build/logo.png';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const Setup = (): JSX.Element => {
  const [latestStatus, setLatestStatus] = useState<string>('');
  const [progress, setProgress] = useState(13);

  const { setCaptainReady, captainReady } = useLifecycleStore((state) => ({
    setCaptainReady: state.setCaptainReady,
    captainReady: state.captainReady
  }));

  const [setupStatuses, setSetupStatuses] = useState<SetupStatus[]>([
    {
      status: 'running',
      stage: 'check-python-installation',
      message: 'Making sure Python 3.11 is installed on this machine.',
      percent: 10
    },
    {
      status: 'pending',
      stage: 'check-pipx-installation',
      message: 'Check if Pipx is installed on this machine.',
      percent: 30
    },
    {
      status: 'pending',
      stage: 'install-dependencies',
      message: 'Configure all the magic behind Flojoy Studio.',
      percent: 50
    },
    {
      status: 'pending',
      stage: 'spawn-captain',
      message: 'Start the Flojoy Studio backend.',
      percent: 70
    }
  ]);

  const [showError, setShowError] = useState<boolean>(false);
  const [errorTitle, setErrorTitle] = useState<string>('');
  const [errorDesc, setErrorDesc] = useState<string>('');
  const [errorActionName, setErrorActionName] = useState<string>('');
  const [needRestart, setNeedRestart] = useState<boolean>(false);

  const checkPythonInstallation = async (): Promise<void> => {
    try {
      const data = await trpcClient.checkPythonInstallation.query();
      updateSetupStatus({
        stage: 'check-python-installation',
        status: 'completed',
        message: `Python ${data.split(' ')[1]} is installed!`,
        percent: 20
      });
    } catch (err) {
      console.error(err);
      updateSetupStatus({
        stage: 'check-python-installation',
        status: 'error',
        message: 'Cannot find any Python 3.11 installation on this machine :(',
        percent: 0
      });
      setErrorTitle('Could not find Python 3.11 :(');
      setErrorDesc('Please install Python 3.11 and try again!');
      setErrorActionName('Download');
    }
  };

  const checkPipxInstallation = async (): Promise<void> => {
    try {
      const data = await trpcClient.checkPipxInstallation.query();
      updateSetupStatus({
        stage: 'check-pipx-installation',
        status: 'completed',
        message: `Pipx ${data} is installed!`,
        percent: 40
      });
    } catch (err) {
      updateSetupStatus({
        stage: 'check-pipx-installation',
        status: 'warning',
        message:
          'Pipx is not currently installed, we will install it for you and restart Flojoy Studio!',
        percent: 0
      });
      setNeedRestart(true);
    }
  };

  const installDependencies = async (): Promise<void> => {
    try {
      await trpcClient.installPipx.mutate();
      await trpcClient.pipxEnsurepath.mutate();

      const countDown = 3;
      if (needRestart) {
        for (let i = countDown; i > 0; i--) {
          updateSetupStatus({
            stage: 'install-dependencies',
            status: 'running',
            message: `Flojoy Studio needs to restart for changes to take effect, restarting in ${i} second(s)`,
            percent: 60
          });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (isPackaged()) {
          await trpcClient.restartFlojoyStudio.mutate();
        } else {
          alert('Restart is not supported for dev build, please relaunch Flojoy Studio manually!');
        }
      } else {
        await trpcClient.installPoetry.mutate();
        await trpcClient.installDependencies.mutate();

        updateSetupStatus({
          stage: 'install-dependencies',
          status: 'completed',
          message: 'Finished setting up all the magic behind Flojoy Studio.',
          percent: 60
        });
      }
    } catch (err) {
      updateSetupStatus({
        stage: 'install-dependencies',
        status: 'error',
        message: 'Something went wrong when installing dependencies...',
        percent: 0
      });
      setErrorTitle('Something went wrong :(');
      // TODO: automate the log reporting part
      setErrorDesc(
        'Sorry about that! Please open the log folder and send the log to us on Discord!'
      );
      setErrorActionName('Open Log Folder');
    }
  };

  const spawnCaptain = async (): Promise<void> => {
    try {
      await trpcClient.spawnCaptain.mutate();
    } catch (err) {
      updateSetupStatus({
        stage: 'spawn-captain',
        status: 'error',
        message: 'Something went wrong when starting Flojoy Studio...',
        percent: 0
      });
      setErrorTitle('Something went wrong :(');
      // TODO: automate the log reporting part
      setErrorDesc(
        'Sorry about that! Please open the log folder and send the log to us on Discord!'
      );
      setErrorActionName('Open Log Folder');
    }
  };

  const errorAction = async (): Promise<void> => {
    const setupError = setupStatuses.find((status) => status.status === 'error');
    switch (setupError?.stage) {
      case 'check-python-installation':
        window.open('https://www.python.org/downloads/release/python-3116/');
        break;
      case 'check-pipx-installation':
      case 'install-dependencies':
      case 'spawn-captain':
        await trpcClient.openLogFolder.mutate();
        break;
    }
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
    setLatestStatus(setupStatus.message);
    setProgress(setupStatus.percent);
  };

  useEffect(() => {
    // Kick off the setup process with this useEffect
    checkPythonInstallation();
  }, []);

  useEffect(() => {
    // The main logic for the setup process
    const hasError = setupStatuses.find((status) => status.status === 'error');
    const isRunning = setupStatuses.find((status) => status.status === 'running');
    if (hasError) {
      // no need to trigger the next step if there is an error
      setShowError(true);
      return;
    }
    if (isRunning) {
      // or something is already running...
      return;
    }

    const nextStep = setupStatuses.find((status) => status.status === 'pending');
    switch (nextStep?.stage) {
      case 'check-pipx-installation': {
        updateSetupStatus({
          stage: 'check-pipx-installation',
          status: 'running',
          message: 'Checking if Pipx is installed on this machine!',
          percent: 30
        });
        checkPipxInstallation();
        break;
      }
      case 'install-dependencies': {
        updateSetupStatus({
          stage: 'install-dependencies',
          status: 'running',
          message: 'Working hard to set everything up! This may take a while for the first time...',
          percent: 50
        });
        installDependencies();
        break;
      }
      case 'spawn-captain': {
        updateSetupStatus({
          stage: 'spawn-captain',
          status: 'running',
          message: 'Almost there, starting Flojoy Studio...',
          percent: 90
        });
        spawnCaptain();
        break;
      }
    }
  }, [setupStatuses]);

  const { readyState } = useWebSocket('ws://localhost:2333/status', {
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      setCaptainReady(true);
      trpcClient.spawnFlowWindow.mutate();
    } else {
      setCaptainReady(false);
    }
  }, [readyState]);

  return (
    <div className="flex h-screen flex-col">
      {/* <div className="py-4"></div> */}
      {/* <div className="text-4xl font-bold">Welcome to Flojoy Studio!</div> */}
      {/* <div className="py-1"></div> */}
      {/* <div className=""> */}
      {/*   We are excited to have you here, please give us some time to get everything ready :) */}
      {/* </div> */}
      {/**/}
      {/* <div className="py-4"></div> */}
      {/**/}
      {/* <div className="flex flex-col gap-2 rounded-xl bg-background p-4 md:w-1/2"> */}
      {/*   {setupStatuses.map((status, idx) => ( */}
      {/*     <SetupStep status={status.status} key={idx} message={status.message} /> */}
      {/*   ))} */}
      {/* </div> */}
      {/**/}
      {/* <div className="py-4"></div> */}
      {/**/}
      {/* {setupStatuses.find((status) => status.status === 'error') && ( */}
      {/*   <Button */}
      {/*     onClick={async (): Promise<void> => { */}
      {/*       if (isPackaged()) { */}
      {/*         await trpcClient.restartFlojoyStudio.mutate(); */}
      {/*       } else { */}
      {/*         alert( */}
      {/*           'Restart is not supported for dev build, please relaunch Flojoy Studio manually!' */}
      {/*         ); */}
      {/*       } */}
      {/*     }} */}
      {/*   > */}
      {/*     Retry */}
      {/*   </Button> */}
      {/* )} */}

      <div className="grow"></div>

      <div className="flex items-center px-4">
        <img src={logo} alt="logo" className="h-20 w-20" />
        <span className="font-ponymaker text-flojoy text-6xl">Flojoy</span>
      </div>

      <div className="py-2"></div>
      <div className="px-8 text-sm">{latestStatus}</div>
      <div className="py-2"></div>

      <Progress value={progress} className="h-2 w-full animate-pulse rounded-none" />

      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorTitle}</AlertDialogTitle>
            <AlertDialogDescription>{errorDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={errorAction}>{errorActionName}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Setup;
