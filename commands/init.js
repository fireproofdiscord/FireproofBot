const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, CategoryChannel } = require("discord.js");
const https = require("https");
const { promises } = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("init")
		.setDescription("Creates a new repository for the guild on Bitbucket")
		.addStringOption(option =>
			option.setName("repo_name")
				.setDescription("Name of the repository to make. Defaults to the guild ID")
				.setRequired(false)
		),
	async execute(interaction, config) {
		if (!interaction.inGuild()) {
			await interaction.reply("You can only use this command in a guild");
			return;
		}

		const guildId = interaction.guildId;
		const bitbucketUser = config.credentials.bitbucket.user;
		const bitbucketPass = config.credentials.bitbucket.pass;
		const git = config.git;

		let repo_name = interaction.options.getString("repo_name");

		if (repo_name === null) {
			repo_name = guildId;
		}

		const slug = config.slugify(repo_name);

		try {
			await git.listRemote([`https://${bitbucketUser}:${bitbucketPass}@bitbucket.org/fireproofdiscord/${slug}`]);

			await interaction.reply({
				content: "That repository name is taken",
				ephemeral: true
			});
		} catch (err) {
			const results = await config.Repo.findAll({
				where: {
					guildId: guildId
				}
			});

			let dirExists = false;
			
			await promises.access(`../FireproofRepos/${guildId}`)
				.then(() => dirExists = true)
				.catch(() => {});

			if (results.length > 0 || dirExists) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId("replace")
							.setLabel("Replace")
							.setStyle("SUCCESS"),
						new MessageButton()
							.setCustomId("cancel")
							.setLabel("Cancel")
							.setStyle("DANGER")
					);

				confirmation = await interaction.reply({
					content: "There is already a repository for this guild. Would you like to delete it and make a new one?",
					ephemeral: true,
					components: [row],
					fetchReply: true
				});

				const collector = confirmation.createMessageComponentCollector({ componentType: "BUTTON", time: 15000 });

				collector.on("collect", async i => {
					if (i.customId === "cancel") {
						await confirmation.edit({
							content: "Operation cancelled",
							ephemeral: true
						});
					} else {
						await promises.rmdir(`../FireproofRepos/${guildId}`, {recursive: true});

						init(config, slug, guildId, interaction, repo_name, confirmation);
					}
				});
			} else {
				init(config, slug, guildId, interaction, repo_name);
			}
		}
	}
}

async function init(config, slug, guildId, interaction, repo_name, message) {
	const bitbucketUser = config.credentials.bitbucket.user;
	const bitbucketPass = config.credentials.bitbucket.pass;
	const git = config.git;

	const data = JSON.stringify({
		scm: "git",
		project: {
			key: "GUIL"
		},
		name: repo_name
	});

	const options = {
		hostname: `api.bitbucket.org`,
		port: 443,
		path: `/2.0/repositories/fireproofdiscord/${slug}`,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic " + Buffer.from(`${bitbucketUser}:${bitbucketPass}`).toString("base64")
		}
	}

	const req = https.request(options, async res => {
		if (res.statusCode === 200) {
			await git.clone(`https://${bitbucketUser}:${bitbucketPass}@bitbucket.org/fireproofdiscord/${slug}`, guildId);

			const configFile = {
				discordCollaborators: [
					interaction.user.id
				],
				bitbucketCollaborators: []
			}

			await promises.writeFile(`../FireproofRepos/${guildId}/LICENSE`, config.license);
			await promises.writeFile(`../FireproofRepos/${guildId}/CONFIG.sys.json`, JSON.stringify(configFile, null, 4));

			// get all roles
			const roles = await interaction.guild.roles.fetch();
			const roleData = {};
			const roleCounter = 0;

			for (let role of roles) {
				// make role objects
				roleData[roleCounter.toString()] = {
					name: role.name,
					color: "default",
					hoist: role.hoist,
					mentionable: mentionable,
					permissions: role.permissions,
					position: position,
					boost: role.tags.premiumSubscriberRole
				}

				
			}

			// get all channels
			const channels = await interaction.guild.channels.fetch();
			const channelData = {};

			for (let channel of channels) {
				if (channel instanceof CategoryChannel) {
					// make category dirs
					await promises.mkdir(`../FireproofRepos/${guildId}/${channel.name}`);

					// make category objects
					channelData[channel.name] = { permissions: {} };

				} else if (channel instanceof TextChannel) {
					// make text channel objects

				}
			}

			await git.cwd({ path: `../FireproofRepos/${guildId}` })
				.checkout(["-b", "main"])
				.add(".")
				.commit("First commit")
				.push("origin", "main");

			await config.Repo.create({ slug: slug, guildId: guildId });

			if (message) {
				await message.edit(`Repository created at https://bitbucket.org/fireproofdiscord/${slug}`);
			} else {
				await interaction.reply(`Repository created at https://bitbucket.org/fireproofdiscord/${slug}`);
			}
		} else {
			if (message) {
				message.edit({
					content: "An unexpected error occurred",
					ephemeral: true
				});
			} else {
				interaction.reply({
					content: "An unexpected error occurred",
					ephemeral: true
				});
			}

			console.log(res.toString());
		}
	});

	req.on("error", err => {
		if (message) {
			message.edit({
				content: "An unexpected error occurred",
				ephemeral: true
			});
		} else {
			interaction.reply({
				content: "An unexpected error occurred",
				ephemeral: true
			});
		}

		console.log(err);
	});

	req.write(data);
	req.end();
}
