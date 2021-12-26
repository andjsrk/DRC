import type { Snowflake } from 'discord.js'

export interface ITalkTarget {
	current: Array<Snowflake> | null
	targets: Array<Array<Snowflake>>
}
export default class TalkTargetManager {
	public static readonly users = new Map<Snowflake, ITalkTarget>()
	public static create(userId: Snowflake) {
		if (!this.users.has(userId)) {
			this.users.set(userId, { current: null, targets: [] })
		}
	}
	public static serialize() {
		return JSON.stringify([ ...this.users.entries() ])
	}
}
