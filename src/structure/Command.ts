import type { ApplicationCommandOptionData, Awaitable, CommandInteraction } from 'discord.js'

export interface ICommandInit {
	readonly name: string
	readonly description: string
	readonly argDefs: Array<ApplicationCommandOptionData>
	readonly execute: (interaction: CommandInteraction) => Awaitable<void>
}
export default class Command implements ICommandInit {
	public readonly name: string
	public readonly description: string
	public readonly argDefs: Array<ApplicationCommandOptionData>
	public readonly execute: (interaction: CommandInteraction) => Awaitable<void>
	constructor(init: ICommandInit) {
		this.name = init.name
		this.description = init.description
		this.argDefs = init.argDefs
		this.execute = init.execute
	}
}
