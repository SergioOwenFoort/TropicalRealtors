type LogLevel = 'info' | 'warning' | 'error';

class CsvLogger {
  private logs: { level: LogLevel; message: string; details?: any }[] = [];

  log(level: LogLevel, message: string, details?: any) {
    this.logs.push({ level, message, details });
    
    // Also log to console for development
    switch (level) {
      case 'info':
        console.info(message, details);
        break;
      case 'warning':
        console.warn(message, details);
        break;
      case 'error':
        console.error(message, details);
        break;
    }
  }

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}

export const csvLogger = new CsvLogger();
