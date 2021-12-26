import * as fs from 'fs'
import * as path from 'path'
import { Client, Intents } from 'discord.js'
import MatchQueue from './structure/MatchQueue'
import type Command from './structure/Command'
import Button from './structure/component/Button'
import SelectMenu from './structure/component/SelectMenu'
import { loadTalkTargetData, saveTalkTargetData } from './util'
import { TOKEN } from './secret'

const client = new Client({ intents: [ Intents.FLAGS.DIRECT_MESSAGES, ], partials: [ 'CHANNEL' ] })

const commandDirPath = path.join(__dirname, 'commands')
const commands: Array<Command> = fs.readdirSync(commandDirPath).map(
	commandFilePath => require(path.join(commandDirPath, commandFilePath))?.default
)

client.once('ready', async () => {
	Button.init(client)
	SelectMenu.init(client)
	await client.application?.commands.set(commands.map(command => ({
		type: 'CHAT_INPUT',
		name: command.name,
		description: command.description,
		options: command.argDefs,
	})))
	loadTalkTargetData()
	setInterval(() => {
		const pickedUser = MatchQueue.pick(1)
		if (pickedUser !== null) {
			const correspondUsers = MatchQueue.queue.filter(user => user.reqHeadCount === pickedUser[0].reqHeadCount)
			if (correspondUsers.length >= pickedUser[0].reqHeadCount) {
				const pickedUsers = new Array(pickedUser[0].reqHeadCount - 1).fill('').map(() => {
					const picked = correspondUsers.splice(Math.random() * correspondUsers.length - 1, 1)[0]
					MatchQueue.quit(picked.userId)
					return picked
				})
				const members = [ ...pickedUsers, pickedUser[0] ]
				for (const member of members) member.onMatched(pickedUsers.filter($member => member.userId !== $member.userId).map(others => others.userId))
			}
		}
	}, 1000 * 3)
	console.log('logged in')
	process.once('beforeExit', () => {
		saveTalkTargetData()
	})
	process.once('uncaughtExceptionMonitor', () => {
		saveTalkTargetData()
	})
})

client.on('interactionCreate', interaction => {
	if (interaction.isCommand()) {
		for (const command of commands) {
			if (command.name === interaction.commandName) {
				if (interaction.inGuild()) {
					interaction.reply('DM에서만 작동하는 봇입니다.')
				} else {
					command.execute(interaction)
				}
				break
			}
		}
	}
})

client.login(TOKEN)
