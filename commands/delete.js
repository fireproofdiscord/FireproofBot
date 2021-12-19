const { SlashCommandBuilder } = require("@discordjs/builders");
const https = require("https");
const { promises } = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete")
		.setDescription("Deletes a bot-owned guild repository from Bitbucket")
		.addStringOption((option) =>
			option
				.setName("slug")
				.setDescription(
					"Slug (URL ID) of the repository to delete. Defaults to the connected repository"
				)
				.setRequired(false)
		),
	async execute(interaction, config) {
		const slug = interaction.options.getString("slug") || guildId;

		const bitbucketUser = config.credentials.bitbucket.user;
		const bitbucketPass = config.credentials.bitbucket.pass;
		const git = config.git;

		try {
			await git.listRemote([
				`https://${bitbucketUser}:${bitbucketPass}@bitbucket.org/fireproofdiscord/${slug}`,
			]);
		} catch (err) {
			await interaction.reply({
				content: `No repository exists at https://bitbucket.org/fireproofdiscord/${slug}`,
				ephemeral: true,
			});

			return;
		}

		await interaction.deferReply();
	},
};
