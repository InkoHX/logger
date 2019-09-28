import moment from 'moment'
import chalk from 'chalk'
import { inspect } from 'util'

export class Logger {
  public timestamp: string

  constructor () {
    /**
     * Format document: https://momentjs.com/docs/#/parsing/string-format/
     */
    this.timestamp = 'YYYY/MM/DD | HH:mm:ss'
  }

  public info (data: any): this {
    console.log(`${chalk.bgCyan(`[${moment().format(this.timestamp)}]`)} ${this.toString(data)}`)

    return this
  }

  public warn (data: any): this {
    console.log(`${chalk.bgYellow(`[${moment().format(this.timestamp)}]`)} ${chalk.yellow(this.toString(data))}`)

    return this
  }

  public error (data: any): this {
    console.error(`${chalk.bgRed(`[${moment().format(this.timestamp)}]`)} ${chalk.bold.red(this.toString(data))}`)

    return this
  }

  public debug (data: any): this {
    console.log(`${chalk.bgMagenta(`[${moment().format(this.timestamp)}]`)} ${chalk.gray(this.toString(data))}`)

    return this
  }

  public setTimestamp (timestamp: string): this {
    this.timestamp = timestamp

    return this
  }

  public getTimestamp (): string {
    return this.timestamp
  }

  private toString (data: any): string {
    if (typeof data === 'string') return data
    if (typeof data === 'object') {
      if (Array.isArray(data) && data.every((value) => typeof value === 'string')) return data.join('\n')
      else return inspect(data, { depth: Number(Array.isArray(data)) })
    }
    return String(data)
  }
}
