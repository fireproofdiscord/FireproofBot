module.exports = {
	async getOverwrites(channel, roles) {
		const manager = channel.permissionOverwrites;
		const overwrites = {};

		for (let [number, roleId] of Object.entries(roles)) {
			const permissions = manager.resolve(roleId);

			if (!permissions) {
				continue;
			}

			const allow = permissions.allow.toArray();
			const deny = permissions.deny.toArray();

			overwrites[number] = {};

			for (let permission of allow) {
				overwrites[number][permission] = true;
			}

			for (let permission of deny) {
				overwrites[number][permission] = false;
			}
		}

		return overwrites;
	}
}