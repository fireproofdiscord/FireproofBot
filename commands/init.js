const { SlashCommandBuilder } = require("@discordjs/builders");
const { HTTPError } = require("discord.js");
const { deburr } = require("lodash");
const https = require("https");
const { writeFileSync } = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("init")
		.setDescription("Creates a new repository for the guild")
		.addStringOption(option => 
			option.setName("repo_name")
				.setDescription("Name of the repository to make. Defaults to the guild ID")
				.setRequired(false)
		),
	async execute(interaction, config) {
		if (interaction.guildId === null) {
			await interaction.reply("You can only use this command in a guild");
			return;
		}

		const bitbucketUser = config.credentials.bitbucket.user;
		const bitbucketPass = config.credentials.bitbucket.pass;
		const git = config.git;
		
		console.log(config);

		let repo_name = interaction.options.getString("repo_name");
		let slug;

		if (repo_name === null) {
			repo_name = interaction.guildId;
			slug = repo_name;
		} else {
			// from https://github.com/codsen/codsen/blob/main/packages/bitbucket-slug/src/main.ts
			slug = deburr(repo_name)
				.replace(/\]\((.*?)\)/g, "") // remove all within brackets (Markdown links) 
				.replace(/ [-]+ /gi, " ")
				.replace(/[^\w\d\s-]/g, "") // remove non-letters
				.replace(/\s+/g, " ") // collapse whitespace
				.toLowerCase()
				.trim()
				.replace(/ /g, "-"); // replace spaces with dashes
		}
	
		try {
			await git.listRemote([`https://${bitbucketUser}:${bitbucketPass}@bitbucket.org/fireproofdiscord/${slug}`]);
		
			await interaction.reply({
				content: "That repository name is taken",
				ephemeral: true
			});
		} catch(err) {
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
		
			const req = https.request(options, res => {
				if (res.statusCode === 200) {
					git.clone(`https://${bitbucketUser}:${bitbucketPass}@bitbucket.org/fireproofdiscord/${slug}`, interaction.guildId)
						.then(() => {
							writeFileSync(`../FireproofRepos/${interaction.guildId}/LICENSE`, config.license);

							git.cwd({ path: `../FireproofRepos/${interaction.guildId}` })
								.checkout(["-b", "main"])
								.add("LICENSE")
								.commit("First commit")
								.push("origin", "main")
								.then(() => {
									interaction.reply(`Repository created at https://bitbucket.org/fireproofdiscord/${slug}`)
								});
						});
				} else {
					interaction.reply({
						content: "An unexpected error occurred",
						ephemeral: true
					});

					console.log(res.statusCode);
				}
			});
		
			req.on("error", err => {
				interaction.reply({
					content: "An unexpected error occurred",
					ephemeral: true
				});

				console.log(err);
			});
		
			req.write(data);
			req.end();
		}
	}
}
