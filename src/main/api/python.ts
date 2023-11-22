import { t } from '.';
import {
  checkPythonInstallation,
  checkPipxInstallation,
  installPipx,
  pipxEnsurepath,
  installPoetry,
  installDependencies,
  spawnCaptain
} from '../python';

export const pythonRouter = t.router({
  checkPythonInstallation: t.procedure.query(async () => {
    return await checkPythonInstallation();
  }),

  checkPipxInstallation: t.procedure.query(async () => {
    return await checkPipxInstallation();
  }),

  installPipx: t.procedure.query(async () => {
    return await installPipx();
  }),

  pipxEnsurepath: t.procedure.query(async () => {
    return await pipxEnsurepath();
  }),

  installPoetry: t.procedure.query(async () => {
    return await installPoetry();
  }),

  installDependencies: t.procedure.query(async () => {
    return await installDependencies();
  }),

  spawnCaptain: t.procedure.query(async () => {
    spawnCaptain();
  })
});
