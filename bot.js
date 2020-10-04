const Eris = require("eris");
const config = require("./config.json");
const client = new Eris(config.token, {
    defaultImageFormat: "png",
    defaultImageSize: 1024,
    /*intents: [
        "GUILDS",
        //"GUILD_MEMBERS",
        "GUILD_BANS",
        "GUILD_EMOJIS",
        "GUILD_VOICE_STATES",
        //"GUILD_PRESENCES",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS"
    ]*/
});

const fs = require("fs");
const sequelize = require("sequelize");
const superagent = require("superagent");

const ctx = {};
ctx.client = client;
ctx.bot = client;

ctx.libs = {
    eris: Eris,
    sequelize: sequelize,
    superagent: superagent,
};

ctx.utils = require("./utils.js");

ctx.db = new sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,

    // SQLite only
    storage: "database.sqlite",
    define: {
        freezeTableName: true,
    },
});

let initDB = require("./utils/databases.js");
ctx.databases = initDB(ctx);

ctx.vc = new Eris.Collection();
ctx.cmds = new Eris.Collection();
ctx.emotes = new Eris.Collection();
ctx.events = new Eris.Collection();
ctx.awaitMsgs = new Eris.Collection();
ctx.ratelimits = new Eris.Collection();

ctx.prefix = config.prefix;
ctx.clientid = config.clientid;
ctx.logid = config.logid;
ctx.ownerid = config.ownerid;
ctx.elevated = config.elevated;

ctx.apikeys = require("./apikeys.json");

client.on("ready", () => {
    console.log("HiddenPhox Instance Loaded.");
    console.log("Logged in as: " + client.user.username);

    client.getDMChannel(ctx.ownerid).then((c) => {
        c.createMessage(":white_check_mark: Loaded HiddenPhox.");
    });

    /*if (ctx.apikeys.dbots)
        superagent
            .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
            .set("Authorization", ctx.apikeys.dbots)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbots] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbots] Failed to post stats: "${e}"`);
            });

    if (ctx.apikeys.dbl)
        superagent
            .post(`https://discordbots.org/api/bots/stats`)
            .set("Authorization", ctx.apikeys.dbl)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbl] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbl] Failed to post stats: "${e}"`);
            });*/

    for (const guild of ctx.bot.guilds.values()) {
        for (const emote of guild.emojis.values()) {
            emote.guild_id = guild.id;
            ctx.emotes.set(emote.id, emote);
        }
    }
});

client.on("guildCreate", function (guild) {
    let bots = 0;
    for (const m of guild.members.values()) if (m.bot) ++bots;

    /*if (ctx.apikeys.dbots)
        superagent
            .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
            .set("Authorization", ctx.apikeys.dbots)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbots] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbots] Failed to post stats: "${e}"`);
            });

    if (ctx.apikeys.dbl)
        superagent
            .post(`https://discordbots.org/api/bots/stats`)
            .set("Authorization", ctx.apikeys.dbl)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbl] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbl] Failed to post stats: "${e}"`);
            });*/

    ctx.utils.logInfo(
        ctx,
        `Joined Guild: '${guild.name}' (${guild.id}) | Percentage: ${Math.floor(
            (bots / guild.memberCount) * 100
        )}%, Bots: ${bots}, Humans: ${guild.memberCount - bots}, Total: ${
            guild.memberCount
        } | Now in ${ctx.bot.guilds.size} guilds.`
    );

    if (bots >= 50 && Math.floor((bots / guild.memberCount) * 100) >= 70) {
        ctx.utils.logInfo(
            ctx,
            `'${guild.name}' (${guild.id}) detected as a bot collection, leaving!`
        );
        guild.leave();
    }
});

client.on("guildDelete", function (guild) {
    /*if (ctx.apikeys.dbots)
        superagent
            .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
            .set("Authorization", ctx.apikeys.dbots)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbots] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbots] Failed to post stats: "${e}"`);
            });

    if (ctx.apikeys.dbl)
        superagent
            .post(`https://discordbots.org/api/bots/stats`)
            .set("Authorization", ctx.apikeys.dbl)
            .send({ server_count: ctx.bot.guilds.size })
            .then(() => {
                ctx.utils.logInfo(ctx, `[dbl] Posted stats.`);
            })
            .catch(e => {
                ctx.utils.logWarn(ctx, `[dbl] Failed to post stats: "${e}"`);
            });*/

    ctx.utils.logInfo(
        ctx,
        `Left Guild: '${guild.name}' (${guild.id}) | Now in ${ctx.bot.guilds.size} guilds.`
    );
});

const cmdDir = fs.readdirSync(__dirname + "/cmds");
for (const file of cmdDir) {
    const newCmd = require(`${__dirname}/cmds/${file}`);

    function loadCommand(cmd) {
        ctx.cmds.set(cmd.name, cmd);
        console.log(`Loaded Command: ${cmd.name}`);
    }

    if (newCmd.name && newCmd.func) {
        loadCommand(newCmd);
    } else if (newCmd.length > 0) {
        for (const subCmd of newCmd) {
            if (subCmd.func && subCmd.name) {
                loadCommand(subCmd);
            }
        }
    }
}

let createEvent = function (client, event, ctx) {
    const eventName = event.event + "|" + event.name;

    if (event.event == "timer") {
        if (!event.interval) {
            console.log(
                `No interval for event: ${eventName}, not setting up interval.`
            );
            return;
        }
        ctx.events.get(eventName).timer = setInterval(
            event.func,
            event.interval,
            ctx
        );
    } else {
        event._func = event.func;
        event.func = (...args) => event._func(...args, ctx);
        client.on(event.event, event.func);
    }
};

var eventDir = fs.readdirSync(__dirname + "/events");
for (const file of eventDir) {
    let newEvent = require(__dirname + "/events/" + file);

    function loadEvent(event) {
        const eventName = event.event + "|" + event.name;

        ctx.events.set(eventName, event);
        createEvent(client, event, ctx);
        console.log(`Loaded event: ${eventName} (${file})`);
    }

    if (newEvent.event && newEvent.func && newEvent.name) {
        loadEvent(newEvent);
    } else if (newEvent.length) {
        for (const subEvent of newEvent) {
            loadEvent(subEvent);
        }
    }
}

async function commandHandler(msg) {
    if (msg.author) {
        if (msg.author.id == ctx.bot.user.id) return;
        let sdata = {};
        if (msg.channel.guild) {
            sdata = await ctx.db.models.sdata.findOrCreate({
                where: { id: msg.channel.guild.id },
            });
        }

        if (
            msg.channel.guild &&
            msg.author.bot &&
            !sdata[0].dataValues.funallowed
        )
            return;

        let prefix = ctx.prefix; // config
        let prefix2 = ctx.bot.user.mention + " "; // mention
        let prefix22 = ctx.bot.user.mention + " "; // mention w/ nick bs
        prefix22 = prefix22.replace("<@", "<@!");
        let prefix3 = msg.channel.guild ? sdata[0].dataValues.prefix : ""; //guild
        let prefix4 = await ctx.db.models.udata
            .findOrCreate({ where: { id: msg.author.id } })
            .then((x) => x[0].dataValues.prefix); //personal
        let hasRan = false;
        let content = msg.content;

        if (content.startsWith(prefix2)) {
            content = content.replace(prefix2, prefix);
        }
        if (content.startsWith(prefix22)) {
            content = content.replace(prefix22, prefix);
        }

        if (
            msg.channel.guild &&
            prefix3 !== "" &&
            content.startsWith(prefix3)
        ) {
            content = content.replace(prefix3, prefix);
        }

        if (prefix4 !== "" && content.startsWith(prefix4)) {
            content = content.replace(prefix4, prefix);
        }

        let [cmd, ...args] = content.split(" ");

        let [cmd2, ...args2] = msg.cleanContent.split(" ");

        cmd = cmd.toLowerCase();
        cmd2 = cmd2.toLowerCase();

        for (const c of ctx.cmds.values()) {
            if (cmd == prefix + c.name) {
                if (
                    c.guild &&
                    msg.channel.guild &&
                    !c.guild.includes(msg.channel.guild.id)
                )
                    return;
                try {
                    c.func(ctx, msg, args.join(" "));
                    ctx.utils.logInfo(
                        ctx,
                        `'${msg.author.username}' (${
                            msg.author.id
                        }) ran command '${cmd2} ${
                            cmd2 == prefix + "eval"
                                ? "<eval redacted>"
                                : cmd2 == prefix + "exec"
                                ? "<exec redacted>"
                                : `${args2
                                      .join(" ")
                                      .split("")
                                      .splice(0, 50)
                                      .join("")}${
                                      args2.join(" ").length > 50 ? "..." : ""
                                  }`
                        }' in '#${
                            msg.channel.name ? msg.channel.name : msg.channel.id
                        }' on '${
                            msg.channel.guild ? msg.channel.guild.name : "DMs"
                        }'${
                            msg.channel.guild
                                ? " (" + msg.channel.guild.id + ")"
                                : ""
                        }`
                    );
                } catch (e) {
                    msg.channel.createMessage(
                        ":warning: An error occured.\n```\n" +
                            e.message +
                            "\n```"
                    );
                    ctx.utils.logWarn(
                        ctx,
                        `'${cmd2} ${
                            cmd2 == prefix + "eval"
                                ? "<eval redacted>"
                                : args2
                                      .join(" ")
                                      .split("")
                                      .splice(0, 50)
                                      .join("")
                        }${
                            args2.join(" ").length > 50 ? "..." : ""
                        }' errored with '${e.message}'`
                    );
                }

                hasRan = true;
                msg.hasRan = true;
            }

            if (
                c.aliases &&
                (cmd == prefix + c.name ||
                    cmd ==
                        prefix +
                            c.aliases.find(
                                (a) => a == cmd.replace(prefix, "")
                            )) &&
                !hasRan
            ) {
                if (
                    c.guild &&
                    msg.channel.guild &&
                    !c.guild.includes(msg.channel.guild.id)
                )
                    return;
                try {
                    c.func(ctx, msg, args.join(" "));
                    ctx.utils.logInfo(
                        ctx,
                        `'${msg.author.username}' (${
                            msg.author.id
                        }) ran guild command '${cmd2} ${
                            cmd2 == prefix + "eval"
                                ? "<eval redacted>"
                                : args2
                                      .join(" ")
                                      .split("")
                                      .splice(0, 50)
                                      .join("")
                        }${args2.join(" ").length > 50 ? "..." : ""}' in '#${
                            msg.channel.name ? msg.channel.name : msg.channel.id
                        }' on '${
                            msg.channel.guild ? msg.channel.guild.name : "DMs"
                        }'${
                            msg.channel.guild
                                ? " (" + msg.channel.guild.id + ")"
                                : ""
                        }`
                    );
                } catch (e) {
                    msg.channel.createMessage(
                        ":warning: An error occured.\n```\n" +
                            e.message +
                            "\n```"
                    );
                    ctx.utils.logWarn(
                        ctx,
                        `'${cmd2} ${
                            cmd2 == prefix + "eval"
                                ? "<eval redacted>"
                                : args2
                                      .join(" ")
                                      .split("")
                                      .splice(0, 50)
                                      .join("")
                        }${
                            args2.join(" ").length > 50 ? "..." : ""
                        }' errored with '${e.message}'`
                    );
                }

                hasRan = true;
                msg.hasRan = true;
            }
        }
    }
}

client.on("messageCreate", commandHandler);

client.on("messageUpdate", (msg) => {
    let oneday = Date.now() - 86400000;
    if (msg.timestamp > oneday && !msg.hasRan) {
        commandHandler(msg);
    }
});

process.on("unhandledRejection", (err, origin) => {
    console.log(`Uncaught rejection: ${err}`);
    if (err.length > 1900) {
        ctx.utils.makeHaste(
            ctx,
            msg,
            `${err} (${origin})`,
            "Uncaught rejection: Output too long to send in a message: "
        );
    } else {
        ctx.utils.logWarn(ctx, `Uncaught rejection: '${err}'`);
    }
});

client.on("error", (err) => {
    console.log(`Error: '${err.message}'`);
    if (err.message.length > 1900) {
        ctx.utils.makeHaste(
            ctx,
            msg,
            err.message,
            "Error: Output too long to send in a message: "
        );
    } else {
        ctx.utils.logWarn(ctx, `Error: '${err.message}'`);
    }
});

client.connect();

var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

rl.on("line", function (line) {
    console.log(eval(line));
});
