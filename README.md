# Fireproof
Discord bot to manage guilds using git<br>
Only supports Github (for now)<br>
&lt;argument&gt; denotes a required argument<br>
\[argument\] denotes an optional argument

## Terms
### Push
Pushing means uploading the changes that have been made to Github, where they can be pulled
### Pull
Pulling means downloading the changes from Github to the local machine, and in this case changing the guild structure to match
### Repository
The place on Github where your specific files are stored
This description might seem irrelevant, but the bot stores your guild information in files

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
To add a user, mention the user
You can avoid pinging the member by putting a \\ before the mention<br>
If you do, it will look like `<@901858993188794430>` instead of `@User` when you send it

## Basic Commands
### easypull &lt;target&gt;
`target` must be the name of a repository managed by the bot<br>
This command runs [clone](#clone) on the repository you give it, and [pull](#pull)s every time there is a new commit to the main branch of the chosen repository<bR>
If you run this command again with the same `target`, it will resume syncing if [stopsync](#stopsync) was run<br>
If you run this command again with a different `target`, it will switch repositories to the new `target`<br>
Depending on your [settings](#settings), this can either:
- Remove all channels, categories, emojis, and roles
- Remove only synced channels, categories, emojis, and roles
- Add the new channels, categories, emojis, and roles on top of what is already there
This is the easiest way to sync your guild to another guild
#### Note
Just as you cannot [clone](#clone) multiple repositories at once, you cannot easypull multiple repositories at once. This means you can only sync with a single guild at a time

### easypush \[repo_name\]
`repo_name` defaults to the ID of the guild the command was used in<br>
This command is the equivalent of the following commands:
1. init `repo_name` (only if not yet run)
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

## Advanced Commands
### init \[repo_name\]
`repo_name` defaults to the guild ID<br>
Creates a new repository on Github for the guild the command was used in<br>
The repository will be created at fireproofdiscord/`repo_name`

### delete
Deletes a repository made for a guild by the bot<br>
Can only be used to delete repos you made yourself using [init](#init) or [easypush](#easypush)

### clone &lt;target&gt;
`target` must be the name of a repository managed by the bot<br>
Makes the guild the command was used in able to sync with a repository<br>
This can be any correctly formatted repository that [fireproofdiscord](https://github.com/fireproofdiscord) has access to (any public Github repo)<br>

### ignore &lt;targets&gt;
`targets` can be any combination of channels, categories, emojis, and roles<br>
Adds all items in `targets` to the ignore list<br>
Anything on the ignore list is not synced to the connected repository
#### Note
This does not remove already added items from the repo. For that see [rm](#rm)

### rm
Removes items from the connected repository<br>
The removed items are still available in the commit history, due to the nature of version control

### add &lt;targets&gt;
`targets` can be any combination of channels, categories, emojis, and roles, or `.` to add all changes<br>
Adds `targets` to be staged in the next commit

### commit &lt;message&gt;
Stages the changes added with [add](#add)<br>
Can be used multiple times per push to split the messages up on the repository

### push
Pushes all staged commits to the connected repository<br>
Can only be used by the user that added the guild to the repository or users that have been given permission using [letpush](#letpush)

### letpushdiscord &lt;user&gt; &lt;type&gt;
`user` must be a member of the server the command was used in<br>
Valid `type`s are:
##### branch
This type lets the user push to a branch of the repository and make [pull requests](#pr) to merge the commits to other branches
##### full
This type lets the user push straight to the current branch of the repository


Lets another Discord user push to the repository

### letpushgithub &lt;repo_name&gt; &lt;email&gt; &lt;
`repo_name` must be the name of a repository managed by the bot<br>
`email` must be the email of a user to invite as a collaborator<br>
The user will need to accept the invitation from the email they will receive from noreply@github.com<br>
This lets the user push straight to the repository using any git client that supports Github<br>
Any user can make a pull request from a fork, which will need to be accepted either using a git client or [praccept](#praccept)

### pull
Pulls new commits into the server
