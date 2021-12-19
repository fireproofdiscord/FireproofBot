const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
const https = require("https");
const { promises } = require("fs");
const { getOverwrites } = require("../func.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("init")
		.setDescription("Creates a new repository for the guild on Bitbucket")
		.addStringOption((option) =>
			option
				.setName("repo_name")
				.setDescription(
					"Name of the repository to make. Defaults to the guild ID"
				)
				.setRequired(false)
		),
	async execute(interaction, config) {
		if (!interaction.inGuild()) {
			await interaction.reply("You can only use this command in a guild");
			return;
		}

		await interaction.deferReply();

		const guildId = interaction.guildId;
		const bitbucketUser = config.credentials.bitbucket.user;
		const bitbucketPass = config.credentials.bitbucket.pass;
		const git = config.git;

		let repo_name = interaction.options.getString("repo_name") || guildId;

		const slug = config.slugify(repo_name);

		try {
			await git.listRemote([
				`https://${bitbucketUser}:${bitbucketPass}@bitbucket.org/fireproofdiscord/${slug}`,
			]);

			await interaction.followUp({
				content: "That repository name is taken",
				ephemeral: true,
			});
		} catch (err) {
			const results = await config.Repo.findAll({
				where: {
					guildId: guildId,
				},
			});

			let dirExists = false;

			await promises
				.access(`../FireproofRepos/${guildId}`)
				.then(() => (dirExists = true))
				.catch(() => {});

			if (results.length > 0 || dirExists) {
				const row = new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId("replace")
						.setLabel("Replace")
						.setStyle("PRIMARY"),
					new MessageButton()
						.setCustomId("cancel")
						.setLabel("Cancel")
						.setStyle("SECONDARY")
				);

				const confirmation = await interaction.followUp({
					content:
						"There is already a repository for this guild. Would you like to delete it and make a new one?",
					ephemeral: true,
					components: [row],
					fetchReply: true,
				});

				const collector = confirmation.createMessageComponentCollector({
					componentType: "BUTTON",
					time: 15000,
				});

				collector.on("collect", async (i) => {
					if (i.customId === "cancel") {
						await confirmation.edit({
							content: "Operation cancelled",
							ephemeral: true,
						});
					} else {
						await promises.rm(`../FireproofRepos/${guildId}`, {
							recursive: true,
						});

						await config.Repo.destroy({
							where: {
								guildId: guildId,
							},
						});

						await config.Role.destroy({
							where: {
								guildId: guildId,
							},
						});

						init(config, slug, guildId, interaction, repo_name);
					}
				});
			} else {
				init(config, slug, guildId, interaction, repo_name);
			}
		}
	},
};

async function init(config, slug, guildId, interaction, repo_name) {
	const bitbucketUser = config.credentials.bitbucket.user;
	const bitbucketPass = config.credentials.bitbucket.pass;
	const git = config.git;

	const data = JSON.stringify({
		scm: "git",
		project: {
			key: "GUIL",
		},
		name: repo_name,
	});

	const options = {
		hostname: `api.bitbucket.org`,
		port: 443,
		path: `/2.0/repositories/fireproofdiscord/${slug}`,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization:
				"Basic " +
				Buffer.from(`${bitbucketUser}:${bitbucketPass}`).toString("base64"),
		},
	};

	const req = https.request(options, async (res) => {
		if (res.statusCode === 200) {
			try {
				await git.clone(
					`https://${bitbucketUser}:${bitbucketPass}@bitbucket.org/fireproofdiscord/${slug}`,
					guildId
				);

				const configFile = {
					creator: interaction.user.id,
					discordCollaborators: [interaction.user.id],
					bitbucketCollaborators: [],
				};

				await promises.writeFile(
					`../FireproofRepos/${guildId}/LICENSE`,
					config.license
				);
				await promises.writeFile(
					`../FireproofRepos/${guildId}/config.sys.json`,
					JSON.stringify(configFile, null, 4)
				);

				// array for all items to be added to repos.sqlite
				const toAdd = [];

				// get all roles
				const roles = await interaction.guild.roles.fetch();
				const roleData = {};
				let roleCounter = 0;

				// stores role numbers and ids for channel overwrites
				const overwriteRoles = {};

				for (let role of roles) {
					role = role[1];

					// continue if role is managed by an integration or bot
					if (role.tags) {
						if (role.tags.botId || role.tags.integrationId) {
							continue;
						}
					}

					toAdd.push(
						config.Role.build({
							number: roleCounter,
							roleId: role.id || "default",
							guildId: interaction.guildId,
						})
					);

					let boost;

					if (role.tags && role.tags.premiumSubscriberRole) {
						boost = true;
					} else {
						boost = false;
					}

					// make role objects
					roleData[roleCounter.toString()] = {
						name: role.name,
						color: "default",
						hoist: role.hoist,
						mentionable: role.mentionable,
						permissions: role.permissions,
						position: role.position,
						boost: boost,
					};

					overwriteRoles[roleCounter.toString()] = role.id;

					roleCounter++;
				}

				// get all channels
				const channels = await interaction.guild.channels.fetch();
				const categoryData = {};
				const channelData = {};

				for (let channel of channels) {
					channel = channel[1];

					if (channel.type === "GUILD_CATEGORY") {
						// make category dirs
						await promises.mkdir(
							`../FireproofRepos/${guildId}/${channel.name}`
						);

						const permissions = getOverwrites(channel, overwriteRoles);

						// make category objects
						categoryData[channel.name] = { permissions: permissions };
					} else if (channel.type === "GUILD_TEXT") {
						// make text channel objects
						const permissions = getOverwrites(channel, overwriteRoles);

						let path = channel.name;

						if (channel.parent) {
							path = `${channel.parent.name}/${channel.name}`;
						}

						channelData[path] = {
							type: "text",
							topic: channel.topic,
							permissions: permissions,
							nsfw: channel.nsfw,
							position: channel.position,
						};
					} else if (channel.type === "GUILD_VOICE") {
						//make voice channel objects
						const permissions = getOverwrites(channel, overwriteRoles);

						let path = channel.name;

						if (channel.parent) {
							path = `${channel.parent.name}/${path}`;
						}

						channelData[path] = {
							type: "voice",
							permissions: permissions,
							bitrate: channel.bitrate,
							position: channel.position,
							rtcRegion: channel.rtcRegion,
							userLimit: channel.userLimit,
						};
					}
				}

				await promises.writeFile(
					`../FireproofRepos/${guildId}/roles.sys.json`,
					JSON.stringify(roleData, null, 4)
				);

				for (let [path, channel] of Object.entries(categoryData)) {
					await promises.writeFile(
						`../FireproofRepos/${guildId}/${path}/category.sys.json`,
						JSON.stringify(channel, null, 4)
					);
				}

				for (let [path, channel] of Object.entries(channelData)) {
					await promises.writeFile(
						`../FireproofRepos/${guildId}/${path}.json`,
						JSON.stringify(channel, null, 4)
					);
				}

				await git
					.cwd({ path: `../FireproofRepos/${guildId}` })
					.checkout(["-b", "main"])
					.add(".")
					.commit("First commit")
					.push("origin", "main");

				await config.Repo.create({ slug: slug, guildId: guildId });

				for (let role of toAdd) {
					await role.save();
				}

				await interaction.followUp(
					`Repository created at https://bitbucket.org/fireproofdiscord/${slug}`
				);
			} catch (err) {
				await promises.rm(`../FireproofRepos/${guildId}`, { recursive: true });

				await interaction.followUp({
					content: "An unexpected error occurred",
					ephemeral: true,
				});

				console.error(err);
			}
		} else {
			await interaction.followUp({
				content: "An unexpected error occurred",
				ephemeral: true,
			});

			console.log(res.toString());
		}
	});

	req.on("error", async (err) => {
		await interaction.followUp({
			content: "An unexpected error occurred",
			ephemeral: true,
		});

		console.log(err);
	});

	req.write(data);
	req.end();
}
