import moment from 'moment'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { inspect } from 'util'
import { EOL } from 'os'

export type LogType = 'INFO'
  | 'WARN'
  | 'ERROR'
  | 'DEBUG'

export interface DisplayOptions {
  info?: boolean
  warn?: boolean
  error?: boolean
  debug?: boolean
}

export interface LoggerOptions {
  logging?: boolean
  file?: string
  timestamp?: string
  display?: {
    console?: DisplayOptions
    file?: DisplayOptions
  }
}

interface WriteOptions {
  console?: boolean
  file?: boolean
}

const defaultLoggerOptions: LoggerOptions = {
  logging: false,
  timestamp: 'YYYY/MM/DD HH:mm:ss',
  display: {
    console: {
      info: true,
      warn: true,
      error: true,
      debug: true
    },
    file: {
      info: true,
      warn: true,
      error: true,
      debug: true
    }
  }
}

const colors: { [key in LogType]: (timestamp: string, data: string, noColor?: boolean) => string } = {
  INFO: (timestamp, data) => `${chalk.bgBlueBright(`[${moment().format(timestamp)}]`)} ${data}`,
  WARN: (timestamp, data, noColor = false) => `${chalk.bgKeyword('darkorange')(`[${moment().format(timestamp)}]`)} ${noColor === true ? data : chalk.keyword('darkorange')(data)}`,
  ERROR: (timestamp, data, noColor = false) => `${chalk.bgRedBright(`[${moment().format(timestamp)}]`)} ${noColor === true ? data : chalk.bold.redBright(data)}`,
  DEBUG: (timestamp, data, noColor = false) => `${chalk.bgBlackBright(`[${moment().format(timestamp)}]`)} ${noColor === true ? data : chalk.grey(data)}`
}

export default class Logger {
  public readonly logPath: string
  public readonly options: LoggerOptions

  public timestamp: string

  private readonly stream: fs.WriteStream | null

  constructor (options?: LoggerOptions) {
    this.options = Utils.mergeObject(defaultLoggerOptions, options || {})

    /**
     * Format document: https://momentjs.com/docs/#/parsing/string-format/
     */
    this.timestamp = this.options.timestamp || 'YYYY/MM/DD HH:mm:ss'

    this.logPath = this.options.file || path.join(process.cwd(), 'program.log')

    this.stream = this.options.logging ? fs.createWriteStream(this.logPath, { flags: 'a' }) : null
  }

  public info (data: any): this {
    return this.writeFile('INFO', data, {
      console: this.options.display?.console?.info,
      file: this.options.display?.file?.info
    })
  }

  public warn (data: any): this {
    return this.writeFile('WARN', data, {
      console: this.options.display?.console?.warn,
      file: this.options.display?.file?.warn
    })
  }

  public error (data: any): this {
    return this.writeFile('ERROR', data, {
      console: this.options.display?.console?.debug,
      file: this.options.display?.file?.debug
    })
  }

  public debug (data: any): this {
    return this.writeFile('DEBUG', data, {
      console: this.options.display?.console?.debug,
      file: this.options.display?.file?.debug
    })
  }

  public setTimestampFormat (timestamp: string): this {
    this.timestamp = timestamp

    return this
  }

  public getTimestampFormat (): string {
    return this.timestamp
  }

  private writeFile (type: LogType, data: any, options: WriteOptions): this {
    if (options.console) console.log(colors[type](this.timestamp, Utils.flatten(data), Utils.isObject(data)))
    if (this.stream && options.file) this.stream.write(`[${moment().format(this.timestamp)}] [${type}] ${Utils.flatten(data, false) + EOL || '\n'}`)

    return this
  }
}

class Utils {
  public static flatten (data: any, color: boolean = true) {
    if (typeof data === 'string') return data
    if (typeof data === 'object') {
      if (data instanceof Error) return data.stack || data.message
      return inspect(data, { depth: Number(Array.isArray(data)), colors: color })
    }

    return String(data)
  }

  public static mergeObject<T> (base: T, object: T): T {
    for (const key in base) {
      if (!Object.prototype.hasOwnProperty.call(object, key) || object[key] === undefined) object[key] = base[key]
      else if (object[key] === Object(object[key])) object[key] = this.mergeObject(base[key], object[key])
    }

    return object
  }

  public static isObject (data: any): boolean {
    if (data instanceof Error) return false

    return typeof data === 'object'
  }
}
