import { MessageActionRow } from 'discord.js'
import type { MessageActionRowComponent } from 'discord.js'
import type { ComponentSetId } from './ComponentBase'

export default class Row {
	public readonly components: Array<ComponentSetId>
	constructor(...components: Array<ComponentSetId>) {
		this.components = components
	}
	public get() {
		return new MessageActionRow({
			components: this.components.map(component => component.get())
		})
	}
}
