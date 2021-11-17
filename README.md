# Fireproof
Discord bot to manage guilds using git<br>
Only supports GitHub (for now)<br>
&lt;argument&gt; denotes a required argument<br>
\[argument\] denotes an optional argument<br>

All repositories made by this bot directly have the MIT license. If you want to change this, feel free to fork the project<br>

Any combination of commands that would add too many channels, categories, emojis, or roles will fail and you will be notified<br>

Most of the [advanced commands](#advanced-commands) can be run from any git client that supports GitHub<br>
You can even use your own repository under your account if you do this

## Terms
### Push
Pushing means uploading the changes that have been made to GitHub, where they can be pulled
### Pull
Pulling means downloading the changes from GitHub to the local machine, and in this case changing the guild structure to match
### Clone
Cloning sets the connected repository. It pulls once automatically when you do it.
### Repository
The place on GitHub where your specific files are stored<br>
This description might seem irrelevant, but the bot stores your guild information in files<br>
You may see this shortened as `repo` in argument names, such as `repo_name` in [easypush](#easypush), but it means the same thing
### Connected Repository
The repository that the guild the command was used in is connected to<br>
You can connect a repository to a guild using [easypull](#easypull) or [clone](#clone)

## Arguments
### Channels
Format channels as #channel_name
### Categories
Format categories as category_name<br>
If there is a space in the category name, put quotes around it like "category name"
### Emojis
To add an emoji, use the emoji
### Roles
To add a role, mention the role<br>
You can avoid pinging the members of the role by putting a \\ before the mention<br>
If you do, it will look like `<@&387716292836902923>` instead of `@Role` when you send it
### Users
To add a user, mention the user<br>
You can avoid pinging the member by putting a \\ before the mention<br>
If you do, it will look like `<@901858993188794430>` instead of `@User` when you send it

## Formatting
Guild repositories must be structured like [this](https://github.com/fireproofdiscord/ExampleGuild)

## Running your own instance
To get your own instance, you can clone or download this repository. First you need to install dependencies with `npm install`, and then before you can run the bot, you will need to create a new file called `config.json` at the root of the project and fill it with a few pieces of information:
### clientId
Required


This is used for registering commands with Discord using `npm run register` and `npm run dev-register`. It is the client ID of your specific bot account that you want to use, which can be found in the [Discord developer portal](https://discord.com/developers/applications) in the General Information tab of your bot, under `APPLICATION ID`. If you have developer mode enabled in your Discord client, you can also right click your bot and click `copy ID`, which will give you the same ID. It should look something like `906613644375257149`.
### githubToken
Required<br>
**KEEP SECRET**


This is the personal access token for the GitHub account you want the bot to use. These can be generated under `Developer Settings -> Personal access tokens` in your account settings. If a malicious user gains access to it, they can use it to perform actions on the linked GitHub account according to the permissions you set. A good safety measure to take is to only give your tokens the permissions they absolutely need. You can always generate a new one with more permissions.
### testGuildId
Optional


This is the ID of the Discord guild you want to use for testing. It can be found by enabling developer mode in your Discord client, right clicking the guild you want to use, and clicking `copy ID`. As it's only used in `npm run dev-register`, it's not required, but it is highly recommended. `npm run dev-register` deploys commands to the guild you give it the ID of, as long as it has the `applications.commands` scope enabled in that guild. This is useful because global commands (deployed with `npm run register`), are cached for 1 hour, which means they may not update in every guild immediately. 
### token
Required<br>
**KEEP SECRET**


This is the token for your Discord bot. Think of it as a username and password combination that the system uses to log in as your bot. It can be found in the `Bot` tab of your bot's settings on the [Discord developer portal](https://discord.com/developers/applications), under `TOKEN`. If a malicious user finds this token, they can use it to do anything with your bot that it has permission to do, depending on the servers it's in. If that happens, you can go back to where you found the token and click `Regenerate` to invalidate the old token and generate a new one.
### bitbucketUser
Required<br>


The username for the Bitbucket account you want to use. Used as part of the login credentials.
### bitbucketPass
Required<br>
**KEEP SECRET**


The password for the Bitbucket account you want to use. **Highly recommended to use an app password.** If you use an app password, generated in the `App passwords` tab of `Personal settings`, you can choose what permissions any program logged in with the password will have, it can only be used through the API, and you can still have 2FA. If a malicious user gets an app password, they will only be able to do what you gave the password permission to do through the API and you can revoke it. By default, the following permissions are required:
##### Repositories
- Admin
- Delete
##### Pull requests
- Write
##### Webhooks
- Read and write

## Example config.json
Note that all of these values have been invalidated by the time this file was uploaded, as they are only to show you how your config.json file should look
```json
{
	"clientId": "906613644375257149",
	"testGuildId": "906614101449527307",
	"token": "OTA2NjEzNjQ0Mzc1MjU3MTQ5.YYbLwA.4q9_6j0YK5MC2LsQ4dSH4R0e4VM",
	"githubToken": "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",
	"bitbucketUser": "ExampleUsername",
	"bitbucketPass": "Aft72fXvUeW3RrW8QQe2"
}
```
## Modifications
This project uses the [MIT license](LICENSE), so you are free to modify it as you wish.
## Running the Bot
Once you have your config.json set up and you want to run the bot, you can do so by first running `npm run dev-register` to register commands into your testing guild, or `npm run register` to register commands in every server (note that it may take up to an hour for global commands to update). Then, to actually run the bot, you can run `npm start`. You will need to keep the terminal window open for the bot to stay online.

## Basic Commands
### easypull 
Arguments:
- &lt;target&gt;


`target` must be the name of a repository managed by the bot<br>
This command runs [clone](#clone) on the repository you give it, and [pull](#pull-1)s every time there is a new commit to the main branch of the chosen repository<br>
If you run this command again with the same `target`, it will resume syncing if [stopsync](#stopsync) was run<br>
If you run this command again with a different `target`, it will switch repositories to the new `target`<br>
Depending on your [sync settings](#syncsettings), this can either:
- Remove all channels, categories, emojis, and roles
- Remove only synced channels, categories, emojis, and roles
- Add the new channels, categories, emojis, and roles on top of what is already there


This is the easiest way to sync your guild to another guild
#### Note
Just as you cannot [clone](#clone) multiple repositories at once, you cannot easypull multiple repositories at once. This means you can only sync with a single guild at a time

### easypush 
Arguments:
- \[repo_name\]


`repo_name` defaults to the ID of the guild the command was used in<br>
The command will fail and you will be notified if `repo_name` is taken<br>
To push to an existing repository using this command, first clone it with [easypull](#easypull) or [clone](#clone)<br>
This command is the equivalent of the following sequence of commands:
1. [init](#init) `repo_name` (only if not yet run)
2. [add](#add) .
3. [commit](#commit) "Easy push"
4. [push](#push)


In other words, it syncs all unignored items to the connected repository<br>
This is the easiest way to sync other guilds to your guild
#### Note
After using this command, unless the other guilds have run [easypull](#easypull), the admins of those guilds will need to pull in some way, such as by running [pull](#pull)

### stopsync
Stops automatically pulling from a repository<br>
Guilds are set to automatically pull by running [easypull](#easypull)

### syncsettings
Arguments:
- &lt;type&gt;


Changes what happens when you connect a new repository with [easypull](#easypull) or [clone](#clone) in a server that already has a connected repository<br>
`full` type also takes effect when connecting to a server that doesn't have a connected repository<br>
All guilds are set to `replace` by default<br>
`type` must be one of the following:
##### full
This setting makes it replace the entire server to match exactly what is in the repository. **This is as dangerous as it seems**
##### replace
This setting makes it only replace the items that came from the old repository, keeping any changes you made yourself
##### combine
This setting makes it keep the server exactly as it is, but put the changes from the new repository on top of what is already in the server

## Advanced Commands
### init 
Arguments:
- \[repo_name\]


`repo_name` defaults to the guild ID<br>
Creates a new repository on GitHub for the guild the command was used in<br>
The command will fail and you will be notified if `repo_name` is taken<br>
The repository will be created at fireproofdiscord/`repo_name`

### delete
Arguments:
- &lt;target&gt;


`target` must be the name of a repository made by the bot<br>
Deletes a repository made for a guild by the bot<br>
Can only be used to delete repos you specifically made yourself using [init](#init) or [easypush](#easypush)

### clone
Arguments:
- &lt;target&gt;


`target` must be the name of a repository made by [fireproofdiscord](https://github.com/fireproofdiscord), or the full URL of any repository it has access to<br>
Makes the guild the command was used in able to sync with a repository<br>
This can be any [correctly formatted](#formatting) repository that [fireproofdiscord](https://github.com/fireproofdiscord) has access to (any public GitHub repository)<br>
The repository will be checked for the correct format when the command is used<br>
After running this command, you can [push](#push-1) or [easypush](#easypush) to update the repository if you have permission<br>
You can also run [fork](#fork) to make your own fork of the repository<br>
If you have permission, you can make a branch on the repository using [checkout b](#checkout-b) and push to that<br>
When used in a guild that already has a connected repository, it will follow that guild's [sync settings](#syncsettings)

### ignore 
Arguments: 
- &lt;targets&gt;


`targets` can be any combination of channels, categories, emojis, and roles<br>
Adds all items in `targets` to .gitignore<br>
Anything in .gitignore is not synced to the connected repository
#### Note
This does not remove already added items from the repo. For that see [rm](#rm)

### rm
Arguments:
- &lt;targets&gt;


`targets` can be any combination of channels, categories, emojis, and roles<br>
Removes items from the connected repository<br>
The removed items are still available in the commit history, due to the nature of version control

### add 
Arguments: 
- &lt;targets&gt;


`targets` can be any combination of channels, categories, emojis, and roles, or `.` to add all changes<br>
Adds `targets` to be staged in the next commit

### commit
Arguments:
- &lt;message&gt;


Stages the changes added with [add](#add)<br>
`message` is used as the commit message<br>
Can be used multiple times per push to split the commits up in the commit history

### push
Pushes all staged commits to the connected repository<br>
Requires changes to be staged with [commit](#commit)<br>
Can only be used by the user that added the guild to the repository or users that have been given permission using [letpush](#letpush)

### letpushdiscord 
Arguments:
- &lt;user&gt;
- &lt;type&gt;


`user` must be a Discord user<br>
Lets another Discord user push to the connected repository<br>
Can only be used by users with `full` push permissions<br>
If you make a repository with [init](#init) or [easypush](#easypush) you already have `full` permissions<br>
Valid `type`s are:
##### branch
This type lets the user push straight to a branch of the repository and make [pull requests](#pr) to merge the commits to other branches
##### full
This type lets the user push straight to the current branch of the repository

### letpushgithub 
Arguments:
- &lt;repo_name&gt;
- &lt;username&gt;


`repo_name` must be the name of a repository made by the bot<br>
`username` must be the username of a user to invite as a collaborator<br>
The user will need to accept the invitation from the email they will receive from noreply@github.com<br>
This lets the user push straight to the repository using any git client that supports GitHub<br>
Any user can make a pull request, which will need to be accepted either using a git client or [praccept](#praccept)

### revokepushdiscord
Arguments:
- &lt;user&gt;


`user` must be a Discord user that has push permissions from [letpushdiscord](#letpushdiscord)<br>
Revokes push permissions from `user` for the connected repository

### revokepushgithub
Arguments:
- &lt;repo_name&gt;
- &lt;username&gt;


`repo_name` must be the name of a repository made by the bot<br>
`username` must be the username of the GitHub account to revoke permissions from<br>
Revokes collaborator status from the user at `username`

### pull
Pulls new commits from the current branch (main by default) into the guild the command was used in

### checkout
Arguments:
&lt;branch&gt;


`branch` must be the name of a branch on the connected repository<br>
Sets the current branch<br>
Obeys the guilds [sync settings](#syncsettings)

### checkout b
Arguments:
&lt;branch&gt;


Makes a new branch and switches to it<br>
`branch` is the name of the new branch you want to make

### branch
Lists all branches of the connected repository

### branch m
Arguments:
- \[old\]
- &lt;new&gt;


`old` defaults to the current branch<br>
Renames `old` branch to `new`

### rebase
Arguments:
- &lt;base&gt;
- \[branch\]


`branch` defaults to the current branch<br>
[Rebases](https://git-scm.com/docs/git-rebase) `branch` onto `base`

### fork
Arguments:
- \[repo_name\]
- &lt;fork_name&gt;


`repo_name` defaults to the connected repository<br>
Forks the repository at fireproofdiscord/`repo_name` into fireproofdiscord/`fork_name`

### reset
Arguments:
- \[commit\]

`commit` defaults to HEAD (the last commit on the current branch)<br>
If `commit` is not HEAD, it must be the short or long hash of a commit on the current branch<br>
Depending on your [sync settings](#syncsettings), does one of the following:
##### full
Replaces your full server structure with the structure from the commit, like if you cloned it with the `full` setting selected
##### replace
Replaces only the parts of the server that came from the repository with the structure from the commit
##### combine
Same as replace
