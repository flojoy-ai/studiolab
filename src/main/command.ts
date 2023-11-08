import log from 'electron-log/main';

export class Command {
  constructor(
    private readonly macCommand: string,
    private readonly windowsCommand: string,
    private readonly linuxCommand: string
  ) {}

  getCommand(): string {
    const platform: NodeJS.Platform = process.platform;
    switch (platform) {
      case 'darwin':
        return this.macCommand;
      case 'win32':
        return this.windowsCommand;
      case 'linux':
        return this.linuxCommand;
      default:
        log.error(`Unsupported platform: ${platform}`);
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
