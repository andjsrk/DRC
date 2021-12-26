import { MessageButton } from 'discord.js'
import type { Client, ButtonInteraction } from 'discord.js'
import ComponentBase, { ComponentSetIdBase } from './ComponentBase'
import type { EventListener } from './ComponentBase'

export enum ButtonColor {
	'RED' = 'DANGER',
	'BLUE' = 'PRIMARY',
	'GREEN' = 'SUCCESS',
	'GRAY' = 'SECONDARY'
}

export default class Button extends ComponentBase<MessageButton, ButtonSetId> {
	constructor() {
		super(new MessageButton(), new Date().getTime(), ButtonSetId)
	}
	public static readonly subscribed = new Map<string, Array<EventListener<ButtonInteraction>>>()
	public static init(client: Client) {
		client.on('interactionCreate', interaction => {
			if (interaction.isButton()) {
				for (const listener of this.subscribed.get(interaction.customId) ?? []) listener(interaction)
			}
		})
	}
}
export class ButtonSetId extends ComponentSetIdBase<MessageButton> {
	public onClick(listener: EventListener<ButtonInteraction>) {
		const { subscribed } = Button
		const id = this._component.customId!
		if (!subscribed.has(id)) subscribed.set(id, [])
		subscribed.get(id)!.push(listener)
		return this
	}
	public setColor(color: keyof typeof ButtonColor) {
		this._component.setStyle(ButtonColor[color])
		return this
	}
	public setContent(content: string) {
		this._component.setLabel(content)
		return this
	}
	public setEmoji(emoji: string) {
		this._component.setEmoji(emoji)
		return this
	}
}
