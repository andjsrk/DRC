import type { Awaitable, MessageActionRowComponent, MessageComponentInteraction } from 'discord.js'

export type EventListener<I extends MessageComponentInteraction> = (interaction: I) => Awaitable<void>

export type ComponentSetId = ComponentSetIdBase<MessageActionRowComponent>

export default abstract class ComponentBase<T extends MessageActionRowComponent, SetId extends ComponentSetIdBase<T>> {
	constructor(protected readonly _component: T, private readonly _now: number, private readonly _ComponentSetId: new (...args: Array<any>) => SetId) {}
	public setId(id: string) {
		this._component.setCustomId(`${this._now}-${id}`)
		return new this._ComponentSetId(this._component)
	}
}
export abstract class ComponentSetIdBase<T extends MessageActionRowComponent> {
	constructor(protected readonly _component: T) {}
	public get() {
		return this._component
	}
}
