import type { Snowflake } from 'discord.js'

export interface IMatchQueueItem {
	reqHeadCount: number
	userId: Snowflake
	onMatched: (targetId: Array<Snowflake>) => void
}
export default class MatchQueue {
	public static readonly queue: Array<IMatchQueueItem> = []
	public static pick(amount: number) {
		if (this.queue.length < 2) {
			return null
		} else {
			return new Array(amount).fill('').map(
				() => this.queue.splice(Math.random() * this.queue.length - 1, 1)[0]
			)
		}
	}
	public static join(userId: Snowflake, reqHeadCount: number, onMatched: (targetIds: Array<Snowflake>) => void) {
		this.queue.push({ reqHeadCount, userId, onMatched })
	}
	public static quit(userId: Snowflake) {
		this.queue.splice(this.queue.findIndex(item => item.userId === userId), 1)
	}
}
