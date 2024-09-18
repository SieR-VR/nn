import { MessageType } from "vscode-languageserver/node";
import { LspClient } from "../client";

export enum LogLevel {
  Error,
  Warning,
  Info,
  Log
}

export namespace LogLevel {
  export function fromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error': return LogLevel.Error;
      case 'warning': return LogLevel.Warning;
      case 'info': return LogLevel.Info;
      case 'log': return LogLevel.Log;
      default: throw new Error(`Unknown log level: ${level}`);
    }
  }

  export function toString(level: LogLevel): string {
    switch (level) {
      case LogLevel.Error: return 'error';
      case LogLevel.Warning: return 'warning';
      case LogLevel.Info: return 'info';
      case LogLevel.Log: return 'log';
    }
  }
}

export interface Logger {
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  log(...args: any[]): void;

  logIgnoreVerbosity(level: LogLevel, ...args: any[]): void;
  trace(level: 'Trace' | 'Info' | 'Error', message: string, data?: any): void;
}

export class LspClientLogger implements Logger {
  constructor(private client: LspClient, private severity: MessageType) { }

  private sendMessage(level: MessageType, messages: any[], overrideLevel: boolean = false) {
    if (overrideLevel || this.severity >= level) {
      const message = messages
        .map(m =>
          typeof m === 'object'
            ? JSON.stringify(m, null, 2)
            : m
        )
        .join(' ');

      this.client.logMessage({
        message,
        type: level
      })
    }
  }

  private logLevelToMessageType(level: LogLevel): MessageType {
    switch (level) {
      case LogLevel.Error: return MessageType.Error;
      case LogLevel.Warning: return MessageType.Warning;
      case LogLevel.Info: return MessageType.Info;
      case LogLevel.Log: return MessageType.Log;
    }
  }

  error(...args: any[]): void {
    this.sendMessage(MessageType.Error, args);
  }

  warn(...args: any[]): void {
    this.sendMessage(MessageType.Warning, args);
  }

  info(...args: any[]): void {
    this.sendMessage(MessageType.Info, args);
  }

  log(...args: any[]): void {
    this.sendMessage(MessageType.Log, args);
  }

  logIgnoreVerbosity(level: LogLevel, ...args: any[]): void {
    this.sendMessage(this.logLevelToMessageType(level), args, true);
  }

  trace(level: 'Trace' | 'Info' | 'Error', message: string, data?: any): void {
    this.logIgnoreVerbosity(LogLevel.Log, `[${now()}] [${level}] ${message}`);
    if (data) {
      this.logIgnoreVerbosity(LogLevel.Log, data2String(data));
    }
  }
}

function now(): string {
  const now = new Date();
  return `${padLeft(`${now.getUTCHours()}`, 2, '0')}:${padLeft(`${now.getMinutes()}`, 2, '0')}:${padLeft(`${now.getUTCSeconds()}`, 2, '0')}.${now.getMilliseconds()}`;
}

function padLeft(s: string, n: number, pad = ' ') {
  return pad.repeat(Math.max(0, n - s.length)) + s;
}

function data2String(data: any): string {
  if (data instanceof Error) {
    return data.stack || data.message;
  }
  if (data.success === false && data.message) {
    return data.message;
  }
  return data.toString();
}
