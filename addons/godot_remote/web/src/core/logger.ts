export class Logger {
	readonly prefix: string


	constructor(prefix: string) {
		this.prefix = prefix
	}


	readonly trace = (...data: any[]): void => console.trace(`[${this.prefix}]`, data)
	readonly debug = (...data: any[]): void => console.debug(`[${this.prefix}]`, data)
	readonly log = (...data: any[]): void => console.log(`[${this.prefix}]`, data)
	readonly warn = (...data: any[]): void => console.warn(`[${this.prefix}]`, data)
	readonly error = (...data: any[]): void => console.error(`[${this.prefix}]`, data)
}
