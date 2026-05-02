# Discord AI Bot

A feature-rich Discord bot built with **Node.js**, **discord.js v14**, **SQLite**, and the **Claude API**. Includes AI-powered commands, persistent moderation tools, an XP/leveling system, button-based polls, persistent reminders, weather lookup, and auto-moderation.

## Features

### 🤖 AI (powered by Claude)
- `/ask <question>` — Ask Claude anything
- `/summarize <count>` — Summarize the last N messages in the channel
- `/translate <text> <language>` — Translate text into any language
- `/tldr <text>` — Compress long text into one or two sentences
- `/roast <user>` — Generate a playful, lighthearted roast

### 🛡️ Moderation
- `/kick <user> [reason]` — Kick a member
- `/ban <user> [reason] [delete_days]` — Ban with optional message purge
- `/mute <user> <minutes> [reason]` — Timeout a member
- `/warn <user> <reason>` — Issue a warning (stored in database)
- `/warnings <user>` — View a member's warning history
- `/clear <count> [user]` — Bulk delete up to 100 messages, optionally per user
- `/slowmode <seconds>` — Set channel slowmode
- `/role <add|remove> <user> <role>` — Manage roles
- `/setwelcome <channel> [message]` — Configure welcome messages

### 📊 Info
- `/serverinfo` — Server overview embed
- `/userinfo [user]` — Member details + roles
- `/avatar [user]` — Full-size avatar

### 🎉 Fun
- `/8ball <question>` — Ask the magic 8-ball
- `/coinflip` — Flip a coin
- `/poll <question> <options>` — Create a poll with **live button voting** and real-time tallies

### 🔧 Utility
- `/remind <when> <message>` — **Persistent reminders** that survive bot restarts (e.g. `10m`, `2h`, `1d`)
- `/color <hex>` — Preview a hex color with RGB values
- `/weather <city>` — Current weather (Open-Meteo, no API key required)
- `/math <expression>` — Evaluate math expressions (powered by mathjs)

### 🏆 Leveling System
- `/rank [user]` — Show level, XP, and progress bar
- `/leaderboard` — Top 10 members
- XP is awarded automatically (15 XP per message, 60s cooldown)
- Level-up announcements

### 🚨 Background features
- **Anti-spam** — Auto-mutes users sending 5 identical messages in 10 seconds
- **Welcome messages** — Configurable per-server greeting embeds for new members
- **Persistent reminders** — Stored in SQLite, fired by a 15-second tick scheduler
- **Auto-loading commands and events** — Drop a file into a category folder, restart, and it works

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 18+ | Native `fetch`, ESM modules |
| Discord client | `discord.js` v14 | Industry standard, full slash command + button support |
| AI | `@anthropic-ai/sdk` (Claude Sonnet 4.6) | Modern long-context model |
| Database | `better-sqlite3` | Synchronous, fast, no async overhead, no separate server |
| Math eval | `mathjs` | Safe expression evaluation |
| Weather | Open-Meteo API | Free, no API key |
| Config | `dotenv` | Standard env var loader |

## Project structure

```
discord-ai-bot/
├── src/
│   ├── bot.js                  # Client setup, event wiring, scheduler boot
│   ├── deploy-commands.js      # Registers slash commands with Discord
│   ├── lib/
│   │   ├── claude.js           # Anthropic API wrapper
│   │   ├── db.js               # SQLite schema + prepared statements
│   │   ├── xp.js               # XP / level math + cooldown logic
│   │   └── reminders.js        # Reminder scheduler + duration parser
│   ├── commands/
│   │   ├── ai/                 # /ask, /summarize, /translate, /tldr, /roast
│   │   ├── moderation/         # /kick, /ban, /mute, /warn, /warnings, /clear, /slowmode, /role, /setwelcome
│   │   ├── info/               # /serverinfo, /userinfo, /avatar
│   │   ├── fun/                # /8ball, /coinflip, /poll
│   │   ├── utility/            # /remind, /color, /weather, /math
│   │   ├── leveling/           # /rank, /leaderboard
│   │   ├── help.js             # Categorized help embed
│   │   └── index.js            # Auto-loader
│   └── events/
│       ├── messageCreate.js    # XP awarding + anti-spam
│       ├── guildMemberAdd.js   # Welcome messages
│       ├── interactionCreate.js # Slash + button routing
│       └── index.js
├── data/
│   └── bot.db                  # SQLite (auto-created, gitignored)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup

### 1. Create a Discord application

1. Go to https://discord.com/developers/applications → **New Application**
2. Under **Bot** → **Reset Token** → copy this as `DISCORD_TOKEN`
3. Under **General Information** → copy **Application ID** as `DISCORD_CLIENT_ID`
4. Under **Bot → Privileged Gateway Intents**, enable:
   - **Server Members Intent**
   - **Message Content Intent**

### 2. Invite the bot

Replace `YOUR_CLIENT_ID` and visit:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=1374658854006&scope=bot+applications.commands
```

This grants: Kick, Ban, Moderate, Manage Roles, Manage Messages, Manage Channels, Read/Send Messages, Embed Links.

### 3. Get an Anthropic API key

Sign up at https://console.anthropic.com → **API Keys** → Create.

### 4. Configure and run

```bash
cp .env.example .env
# Fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, ANTHROPIC_API_KEY

npm install
npm run deploy   # registers slash commands (re-run after adding commands)
npm start        # boots the bot
```

You should see `Logged in as <bot name>` and `Loaded N commands across 6 categories`.

## Deployment to Railway

1. Push the project to GitHub.
2. Sign in at https://railway.app → **New Project → Deploy from GitHub repo**.
3. Add the three environment variables.
4. Railway auto-runs `npm start`.
5. After the first deploy, run `npm run deploy` once locally (or as a one-shot Railway shell command) to register slash commands.

## Notes

- Slash commands take up to 60 minutes to propagate globally on first registration.
- The XP system rewards 15 XP per message with a 60s cooldown to prevent farming.
- Anti-spam triggers after 5 identical messages within 10 seconds; offenders are auto-muted for 5 minutes.
- All persistent state (warnings, XP, reminders, settings) lives in `data/bot.db` — back this file up if you care about retaining data.

## License

MIT
