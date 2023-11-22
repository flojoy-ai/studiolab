import { t } from './trpc';
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

  installPipx: t.procedure.mutation(async () => {
    return await installPipx();
  }),

  pipxEnsurepath: t.procedure.mutation(async () => {
    return await pipxEnsurepath();
  }),

  installPoetry: t.procedure.mutation(async () => {
    return await installPoetry();
  }),

  installDependencies: t.procedure.mutation(async () => {
    return await installDependencies();
  }),

  spawnCaptain: t.procedure.mutation(async () => {
    spawnCaptain();
  })
});
