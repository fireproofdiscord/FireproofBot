const { readdirSync, readFileSync, existsSync } = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const {
	token,
	githubToken,
	bitbucketUser,
	bitbucketPass,
} = require("./config.json");
const { Buffer } = require("buffer");
const simpleGit = require("simple-git");
const { Sequelize, DataTypes } = require("sequelize");
const { deburr } = require("lodash");

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "data/repos.sqlite",
	logging: false,
});

const Repo = sequelize.define(
	"Repo",
	{
		uuid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
			primaryKey: true,
		},
		slug: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		guildId: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
		},
	},
	{
		tableName: "repos",
		timestamps: false,
	}
);

const Role = sequelize.define(
	"Role",
	{
		uuid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
			primaryKey: true,
		},
		number: {
			type: DataTypes.NUMBER,
			allowNull: false,
		},
		roleId: {
			type: DataTypes.STRING(18),
			allowNull: false,
			unique: true,
		},
		guildId: {
			type: DataTypes.STRING(18),
			allowNull: false,
		},
	},
	{
		tableName: "roles",
		timestamps: false,
	}
);

const git = simpleGit("../FireproofRepos");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = readdirSync("./commands").filter((file) =>
	file.endsWith(".js")
);

const credentials = {
	github: githubToken,
	bitbucket: {
		user: bitbucketUser,
		pass: bitbucketPass,
	},
};

const config = {
	credentials: credentials,
	git: git,
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
	},
	Repo: Repo,
	Role: Role,
};

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
	console.log("Bot ready");

	if (!existsSync("./data/data.sqlite")) {
		await sequelize.sync();
	}
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		if (command.execute.length === 2) {
			await command.execute(interaction, { ...config });
		} else {
			await command.execute(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "There was an error while executing this command",
			ephemeral: true,
		});
	}
});

client.login(token);
