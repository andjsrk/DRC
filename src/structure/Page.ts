import type { MessageActionRow, MessageComponentInteraction } from 'discord.js'
import type Row from './component/Row'

export const applyPage = async (interaction: MessageComponentInteraction, page: Page) => {
	await interaction.update({
		components: page.buildPage(interaction)
	})
}

export default class Page<F extends (() => Array<Row>) | ((interaction: MessageComponentInteraction) => Array<Row>) = (interaction: MessageComponentInteraction) => Array<Row>> {
	private makePage: F
	public buildPage: (...args: Parameters<F>) => Array<MessageActionRow>
	constructor(pageMaker: F) {
		this.makePage = pageMaker
		this.buildPage = (...args: Parameters<F>) => this.makePage(...args as [ any ]).map(row => row.get())
	}
}
