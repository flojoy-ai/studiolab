import { t } from '../trpc';
import {
  checkPythonInstallation,
  checkPipxInstallation,
  installPipx,
  pipxEnsurepath,
  installPoetry,
  installDependencies,
  spawnCaptain
} from '../../python';

export const setupRouter = t.router({
  checkPythonInstallation: t.procedure.query(checkPythonInstallation),

  checkPipxInstallation: t.procedure.query(checkPipxInstallation),

  installPipx: t.procedure.mutation(installPipx),

  pipxEnsurepath: t.procedure.mutation(pipxEnsurepath),

  installPoetry: t.procedure.mutation(installPoetry),

  installDependencies: t.procedure.mutation(installDependencies),

  spawnCaptain: t.procedure.mutation(spawnCaptain)
});
