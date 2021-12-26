import * as fs from 'fs'
import * as $path from 'path'
import { Formatters as Fmt, User } from 'discord.js'
import type { BaseCommandInteraction, InteractionReplyOptions, Message, MessageComponentInteraction, MessageOptions, Snowflake } from 'discord.js'
import TalkTargetManager from './structure/TalkTargetManager'
import type { ITalkTarget } from './structure/TalkTargetManager'
import type { NormalInteraction } from './types'

export const hashChars = [
	...new Array(36).fill('').map((_, i) => i.toString(36)), // 0-9 a-z
	...new Array(26).fill('').map((_, i) => (i + 10).toString(36).toUpperCase()) // A-Z
]
export const toStringWithRadix62 = (num: bigint): string => num === 0n ? '' : `${toStringWithRadix62(num / 62n)}${hashChars[Number(num % 62n)]}`
export const makeHash = (userId: Snowflake) => toStringWithRadix62(BigInt(userId) / 1234n)
export const saveTalkTargetData = () => {
	fs.writeFileSync($path.join(__dirname, '..', 'talkTargetData.json'), TalkTargetManager.serialize())
}
export const loadTalkTargetData = () => {
	const jsonFilePath = $path.join(__dirname, '..', 'talkTargetData.json')
	const talkTargetData: Array<[ string, ITalkTarget ]> = fs.existsSync(jsonFilePath) ? require(jsonFilePath) : []
	for (const pair of talkTargetData) TalkTargetManager.users.set(pair[0], pair[1])
}
export const replySafely = async (replyableInteraction: BaseCommandInteraction | MessageComponentInteraction, options: string | InteractionReplyOptions) => {
	if (replyableInteraction.replied || replyableInteraction.deferred) return replyableInteraction.editReply(options)
	else return replyableInteraction.reply(options)
}
export const sendDmSafely = async (user: User, options: string | MessageOptions) => {
	if (user.dmChannel === null) await user.createDM()
	return user.send(options)
}
// @ts-ignore
export const sendSystemMsg: {
	(user: User, content: string, options?: MessageOptions): Promise<Message>
	(interaction: NormalInteraction, content: string, options?: InteractionReplyOptions): Promise<void | Message>
} = async (userOrInteraction: User | NormalInteraction, content: string, options?: MessageOptions | InteractionReplyOptions) => {
	const quotedContent = Fmt.quote(content)
	const $options = {
		content: quotedContent,
		...options !== undefined
		 ? options
		 : {},
	}
	if (userOrInteraction instanceof User) return sendDmSafely(userOrInteraction, $options)
	else return replySafely(userOrInteraction, $options)
}
