import { Formatters as Fmt } from 'discord.js'
import Command from '../structure/Command'
import { L } from '../structure/L'
import MatchQueue from '../structure/MatchQueue'
import TalkTargetManager from '../structure/TalkTargetManager'
import Page, { applyPage } from '../structure/Page'
import Row from '../structure/component/Row'
import Button from '../structure/component/Button'
import SelectMenu, { SelectMenuItem } from '../structure/component/SelectMenu'
import { makeHash, replySafely, sendSystemMsg } from '../util'

const BLANK = '\u200B'

export default new Command({
	name: 'open-menu',
	description: '메뉴 열기',
	argDefs: [],
	async execute(interaction) {
		console.log('executed')
		const main = new Page(() => [
			new Row(
				new Button()
					.setId('dorc.btn.find')
					.setEmoji('🔍')
					.setContent('상대 찾기')
					.setColor('GREEN')
					.onClick(async interaction => {
						const userId = interaction.user.id
						if (MatchQueue.queue.some(item => item.userId === userId)) {
							await sendSystemMsg(interaction, L('already-matching'))
						} else {
							await sendSystemMsg(interaction, L('matching'), {
								components: [
									new Row(
										new Button()
											.setId('dorc.btn.cancelFind')
											.setContent('취소')
											.setColor('GRAY')
											.onClick(async interaction => {
												MatchQueue.quit(userId)
												await interaction.update({
													content: Fmt.quote('취소 완료'),
													components: [],
												})
											})
									).get()
								]
							})
							MatchQueue.join(userId, 1, async targetIds => {
								if (!TalkTargetManager.users.has(interaction.user.id)) TalkTargetManager.create(userId)
								const talkTarget = TalkTargetManager.users.get(userId)!
								talkTarget.current ??= targetIds
								talkTarget.targets.push(targetIds)
								await sendSystemMsg(interaction, L('talk-started', { targets: targetIds.map(id => makeHash(id)).join(', ') }))
							})
						}
					}),
				new Button()
					.setId('dorc.btn.talkList')
					.setEmoji('📃')
					.setContent('상대 목록')
					.setColor('BLUE')
					.onClick(async interaction => {
						await applyPage(interaction, talkTargetSelect)
					}),
			)
		])
		const talkTargetSelect = new Page(interaction => {
			const userId = interaction.user.id
			const backToMainBtn = new Button()
				.setId('dorc.btn.backToMain')
				.setEmoji('⬅️')
				.setContent('돌아가기')
				.setColor('GRAY')
				.onClick(async interaction => {
					await applyPage(interaction, main)
				})
			const titleBtn = new Button()
				.setId('dorc.btn.selectTalkTarget.title')
				.setEmoji('📃')
				.setContent('대화 상대 목록')
				.setColor('BLUE')
				.onClick(interaction => {
					interaction.update({})
				})
			const empty = [
				new Row(backToMainBtn, titleBtn),
				new Row(
					new SelectMenu()
						.setId('dorc.select.selectTalkTarget')
						.setPlaceholder('목록이 비어있습니다.')
						.setItems(
							new SelectMenuItem({
								content: BLANK,
								value: BLANK,
							})
						)
				),
			]
			if (!TalkTargetManager.users.has(userId)) {
				return empty
			} else {
				const talkTarget = TalkTargetManager.users.get(userId)!
				const { targets } = talkTarget
				if (targets.length === 0) {
					return empty
				} else {
					return [
						new Row(backToMainBtn, titleBtn),
						new Row(
							new SelectMenu()
								.setId('dorc.select.selectTalkTarget')
								.setItems(
									...targets.map((targetIds, i) =>
										new SelectMenuItem({
											content: targetIds.map(targetId => makeHash(targetId)).join(', '),
											value: i.toString(),
											default: targetIds.every((id, i) => id === talkTarget.current![i]),
										})
									)
								)
						)
					]
				}
			}
		})
		await replySafely(interaction, {
			content: BLANK,
			components: main.buildPage()
		})
	}
})
