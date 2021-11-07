const { readdirSync } = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { Octokit, App } = require("octokit");
const { token, githubToken } = require("./config.json");

const client = new Client({ intents: [Intents.FLAGS.GUILDS]});

client.commands = new Collection();
const commandFiles = readdirSync("./commands").filter(file => file.endsWith(".js"));

const octokit = new Octokit({
	userAgent: "fireproof-discord",
	auth: githubToken
});

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once("ready", () => {
	console.log("Bot ready");
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		if (command.length === 3) {
			await command.execute(interaction, octokit, githubToken);
		} else if (command.length === 2) {
			await command.execute(interaction, octokit);
		} else {
			await command.execute(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: "There was an error while executing this command.", ephemeral: true });
	}
});

client.login(token);