import { MessageSelectMenu } from 'discord.js'
import type { Client, MessageSelectOptionData, SelectMenuInteraction } from 'discord.js'
import ComponentBase, { ComponentSetIdBase } from './ComponentBase'
import type { EventListener } from './ComponentBase'

export default class SelectMenu extends ComponentBase<MessageSelectMenu, SelectMenuSetId> {
	constructor() {
		super(new MessageSelectMenu(), new Date().getTime(), SelectMenuSetId)
		this._component.setMaxValues(1)
		this._component.setMinValues(1)
	}
	public static readonly subscribed = new Map<string, Array<EventListener<SelectMenuInteraction>>>()
	public static init(client: Client) {
		client.on('interactionCreate', interaction => {
			if (interaction.isSelectMenu()) {
				for (const listener of this.subscribed.get(interaction.customId) ?? []) listener(interaction)
			}
		})
	}
}
export class SelectMenuSetId extends ComponentSetIdBase<MessageSelectMenu> {
	public onClick(listener: EventListener<SelectMenuInteraction>) {
		const { subscribed } = SelectMenu
		const id = this._component.customId!
		if (!subscribed.has(id)) subscribed.set(id, [])
		subscribed.get(id)!.push(listener)
		return this
	}
	public setItems(...items: Array<SelectMenuItem>) {
		this._component.setOptions(...items as Array<MessageSelectOptionData>)
		return this
	}
	public setMaxValueCount(count: number) {
		this._component.setMaxValues(count)
		return this
	}
	public setMinValueCount(count: number) {
		this._component.setMinValues(count)
		return this
	}
	public setPlaceholder(placeholder: string) {
		this._component.setPlaceholder(placeholder)
		return this
	}
}
export interface ISelectMenuInit {
	readonly content: string
	readonly default?: boolean
	readonly description?: string
	readonly emoji?: string
	readonly value: string
}
export class SelectMenuItem {
	public readonly label: string
	public readonly default: boolean | undefined
	public readonly description: string | undefined
	public readonly emoji: string | undefined
	public readonly value: string
	constructor(init: ISelectMenuInit) {
		this.label = init.content
		this.default = init.default
		this.description = init.description
		this.emoji = init.emoji
		this.value = init.value
	}
}
