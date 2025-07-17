declare module 'better-sqlite3' {
  import { EventEmitter } from 'events';

  interface DatabaseOptions {
    verbose?: (...args: any[]) => void;
    fileMustExist?: boolean;
    timeout?: number;
    readonly?: boolean;
  }

  interface Statement {
    run(...params: any[]): { changes: number; lastInsertRowid: number };
    get(...params: any[]): any;
    all(...params: any[]): any[];
    iterate(...params: any[]): IterableIterator<any>;
    bind(...params: any[]): Statement;
    reset(): Statement;
    finalize(): void;
  }

  interface Database extends EventEmitter {
    exec(sql: string): void;
    prepare(sql: string): Statement;
    transaction(fn: () => void): void;
    close(): void;
    backup(filename: string): void;
  }

  class Database extends EventEmitter {
    constructor(filename: string, options?: DatabaseOptions);
    exec(sql: string): void;
    prepare(sql: string): Statement;
    transaction(fn: () => void): void;
    close(): void;
    backup(filename: string): void;
  }
  
  export = Database;
} 