import type { User } from 'discord.js'
import Command from '../structure/Command'
import { L } from '../structure/L'
import TalkTargetManager from '../structure/TalkTargetManager'
import { makeHash, replySafely, sendDmSafely, sendSystemMsg } from '../util'

export default new Command({
	name: 'c',
	description: '채팅 입력',
	argDefs: [
		{
			type: 'STRING',
			name: 'content',
			description: '내용',
			required: true,
		}
	],
	async execute(interaction) {
		const userId = interaction.user.id
		if (!TalkTargetManager.users.has(userId)) {
			await sendSystemMsg(interaction, L('no-talk-targets'))
		} else {
			const talkTarget = TalkTargetManager.users.get(userId)!
			if (talkTarget.current === null) {
				await sendSystemMsg(interaction, L('no-talk-targets'))
			} else {
				const userManager = interaction.client.users
				const currentTargetUsers = await Promise.allSettled(
					talkTarget.current.map(targetId => userManager.cache.get(targetId) ?? userManager.fetch(targetId, { force: false }))
				)
				await sendSystemMsg(interaction, L('sending'))
				const content = interaction.options.getString('content', true)
				const sendRes = await Promise.allSettled(
					currentTargetUsers
						.filter((value): value is PromiseFulfilledResult<User> => value.status === 'fulfilled')
						.map(result => sendDmSafely(result.value!, L('render-chat', { id: makeHash(userId), content })))
				)
				const rejectedCount = sendRes.filter(item => item.status === 'rejected').length
				if (rejectedCount === 0) await replySafely(interaction, L('render-chat-me', { id: makeHash(userId), content }))
				else await sendSystemMsg(interaction, L('send-failed', { count: rejectedCount.toString() }))
			}
		}
	}
})
