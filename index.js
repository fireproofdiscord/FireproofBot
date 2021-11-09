const { readdirSync, readFileSync } = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { token, githubToken, bitbucketUser, bitbucketPass } = require("./config.json");
const { Buffer } = require("buffer");
const simpleGit = require("simple-git");

const git = simpleGit("../FireproofRepos");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = readdirSync("./commands").filter(file => file.endsWith(".js"));

const credentials = {
	github: githubToken,
	bitbucket: {
		user: bitbucketUser,
		pass: bitbucketPass
	}
}

const config = {
	credentials: credentials,
	git: git,
	license: readFileSync("repo_license.txt"),
	slugify(repo_name) {
		// from https://github.com/codsen/codsen/blob/main/packages/bitbucket-slug/src/main.ts
		return deburr(repo_name)
			.replace(/\]\((.*?)\)/g, "") // remove all within brackets (Markdown links) 
			.replace(/ [-]+ /gi, " ")
			.replace(/[^\w\d\s-]/g, "") // remove non-letters
			.replace(/\s+/g, " ") // collapse whitespace
			.toLowerCase()
			.trim()
			.replace(/ /g, "-"); // replace spaces with dashes
	}
}

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
		if (command.execute.length === 2) {
			await command.execute(interaction, {...config});
		} else {
			await command.execute(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: "There was an error while executing this command", ephemeral: true });
	}
});

client.login(token);