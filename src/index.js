require('dotenv').config();
const {
	TOKEN,
	INPUT,
	OUTPUT,
} = process.env;

const Discord = require('discord.js');
const client = new Discord.Client();

let inputChannel;
let outputChannel;
let targetMessage;
const emojiMap = {};

async function getTargetMessage() {
	const messages = await inputChannel.messages.fetch();
	for (let [, message] of messages) {
		if (message.author.username !== 'Hydra') {
			continue;
		}
		if (message.content.match(/queue(\s+)list/i)) {
			return message;
		}
	}
}

async function init() {
	inputChannel = await client.channels.cache.get(INPUT);
	outputChannel = await client.channels.cache.get(OUTPUT);
	targetMessage = await getTargetMessage();
	const topic = targetMessage.channel.topic;
	const lines = topic.trim().split(/\s*\n\s*/);
	for (line of lines) {
		const [, emoji, desc] = line.match(/^([^\s]+)\s+(.*)$/);
		emojiMap[emoji] = desc;
	}
}

async function log(message) {
	await outputChannel.send(message);
}

client.on('message', async (message) => {
	const { name } = message.channel;
	const { author } = message;
	if (author.bot) return;
	await log(`O <@!${author.id}> mandou isso: \`${message.content}\``);
});
client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.message.id != targetMessage.id) {
		return;
	}
	const { _emoji: { name: emoji } } = reaction;
	await log(`O <@!${user.id}> reagiu com ${emoji} (${emojiMap[emoji]})`);
});
client.once('ready', async () => {
	console.log('Initializing...');
	await init();
	console.log('All fine');
});
console.log('Loggin in...');
client.login(TOKEN);
