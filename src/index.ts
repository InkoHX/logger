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

export interface LoggerOptions {
  logging?: boolean
  file?: string
  timestamp?: string
}

const defaultLoggerOptions: LoggerOptions = {
  logging: false
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
    console.log(`${chalk.bgCyan(`[${moment().format(this.timestamp)}]`)} ${Utils.flatten(data)}`)
    this.writeFile('INFO', data)

    return this
  }

  public warn (data: any): this {
    console.log(`${chalk.bgYellow(`[${moment().format(this.timestamp)}]`)} ${Utils.flatten(data)}`)
    this.writeFile('WARN', data)

    return this
  }

  public error (data: any): this {
    console.error(`${chalk.bgRed(`[${moment().format(this.timestamp)}]`)} ${chalk.bold.red(Utils.flatten(data))}`)
    this.writeFile('ERROR', data)

    return this
  }

  public debug (data: any): this {
    console.log(`${chalk.bgMagenta(`[${moment().format(this.timestamp)}]`)} ${chalk.gray(Utils.flatten(data))}`)
    this.writeFile('DEBUG', data)

    return this
  }

  public setTimestampFormat (timestamp: string): this {
    this.timestamp = timestamp

    return this
  }

  public getTimestampFormat (): string {
    return this.timestamp
  }

  private writeFile (type: LogType, data: any) {
    if (this.stream) this.stream.write(`[${moment().format(this.timestamp)}] [${type}] ${Utils.flatten(data, false) + EOL || '\n'}`)
  }
}

class Utils {
  public static flatten (data: any, color: boolean = true) {
    if (typeof data === 'string') return data
    if (typeof data === 'object') return inspect(data, { depth: Number(Array.isArray(data)), colors: color })

    return String(data)
  }

  public static mergeObject<T> (base: T, object: T): T {
    for (const key in base) {
      if (!Object.prototype.hasOwnProperty.call(object, key) || object[key] === undefined) object[key] = base[key]
      else if (object[key] === Object(object[key])) object[key] = this.mergeObject(base[key], object[key])
    }

    return object
  }
}
