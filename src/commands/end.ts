import Command from '../structure/Command'
import { L } from '../structure/L'
import TalkTargetManager from '../structure/TalkTargetManager'
import { makeHash, sendSystemMsg } from '../util'

export default new Command({
	name: 'end',
	description: '대화 종료하기',
	argDefs: [],
	async execute(interaction) {
		const userId = interaction.user.id
		if ((TalkTargetManager.users.get(userId)?.current ?? null) === null) {
			await sendSystemMsg(interaction, L('no-talk-targets'))
		} else {
			const talkTarget = TalkTargetManager.users.get(userId)!
			await sendSystemMsg(interaction, L('leaving-talk'))
			const userManager = interaction.client.users
			const currentTalkTargetsTalkTargets = talkTarget.current!.map(target => TalkTargetManager.users.get(target)!)
			for (const $talkTarget of [ talkTarget, ...currentTalkTargetsTalkTargets ]) {
				$talkTarget.targets = talkTarget.targets.filter(targetId => targetId !== talkTarget.current)
				$talkTarget.current = null
			}
			for (const target of talkTarget.current!) {
				const talkTargetUser = userManager.cache.get(target) ?? await userManager.fetch(target)
				if (talkTargetUser.id !== userId) sendSystemMsg(talkTargetUser, L('leaved', { target: makeHash(userId) }))
				const talkTargetUsersCurrent = TalkTargetManager.users.get(target)!.current!
				talkTargetUsersCurrent.splice(talkTargetUsersCurrent.findIndex(id => id === userId), 1)
				if (talkTargetUsersCurrent.length === 0) {
					TalkTargetManager.users.get(target)!.targets = []
					TalkTargetManager.users.get(target)!.current = null
				}
			}
			talkTarget.current = null
			sendSystemMsg(interaction, L('leave-talk-success'))
		}
	}
})
