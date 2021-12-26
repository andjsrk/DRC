import Command from '../structure/Command'
import { L } from '../structure/L'
import MatchQueue from '../structure/MatchQueue'
import TalkTargetManager from '../structure/TalkTargetManager'
import { makeHash, replySafely, sendSystemMsg } from '../util'

export default new Command({
	name: 'find',
	description: '채팅할 상대 찾기',
	argDefs: [
		{
			type: 'INTEGER',
			name: 'people-count',
			description: '인원',
			required: true,
		}
	],
	async execute(interaction) {
		const userId = interaction.user.id
		if (MatchQueue.queue.some(item => item.userId === userId)) {
			await replySafely(interaction, L('already-matching'))
		} else {
			await replySafely(interaction, L('matching'))
			MatchQueue.join(userId, Number(interaction.options.getInteger('people-count', true)), async targetIds => {
				if (!TalkTargetManager.users.has(interaction.user.id)) TalkTargetManager.create(userId)
				const talkTarget = TalkTargetManager.users.get(userId)!
				talkTarget.current ??= targetIds
				talkTarget.targets.push(targetIds)
				await sendSystemMsg(interaction, L('talk-started', { targets: targetIds.map(id => makeHash(id)).join(', ') }))
			})
		}
	}
})
