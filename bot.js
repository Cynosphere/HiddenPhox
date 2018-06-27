const Eris = require("eris");
const config = require("./config.json");
const client = new Eris(config.token, {
    defaultImageFormat: "png",
    defaultImageSize: 1024
});

const ctx = {};
ctx.client = client;
ctx.bot = client;
ctx.libs = {
    eris: Eris,
    jimp: require("jimp"),
    fs: require("fs"),
    reload: require("require-reload")(require),
    math: require("expr-eval").Parser,
    sequelize: require("sequelize"),
    superagent: require("superagent")
};

ctx.utils = require("./utils.js");

ctx.db = new ctx.libs.sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,

    // SQLite only
    storage: "database.sqlite",
    define: {
        freezeTableName: true
    }
});

let initDB = require("./utils/databases.js");
ctx.databases = initDB(ctx);

ctx.vc = new Eris.Collection();
ctx.cmds = new Eris.Collection();
ctx.emotes = new Eris.Collection();
ctx.events = new Eris.Collection();
ctx.heists = new Eris.Collection();
ctx.snipes = new Eris.Collection();
ctx.esnipes = new Eris.Collection();
ctx.awaitMsgs = new Eris.Collection();
ctx.ratelimits = new Eris.Collection();

ctx.prefix = "hf!";

ctx.logid = "349368487472529410";
ctx.ownerid = "150745989836308480";

ctx.apikeys = require("./apikeys.json");
let swa = require("steam-web-api2");
ctx.steamapi = new swa(ctx.apikeys.steam);

client.on("ready", () => {
    console.log("HiddenPhox Instance Loaded.");
    console.log("Logged in as: " + client.user.username);

    client.getDMChannel(ctx.ownerid).then(c => {
        c.createMessage(":white_check_mark: Loaded HiddenPhox.");
    });

    ctx.libs.superagent
        .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
        .set("Authorization", ctx.apikeys.dbots)
        .send({ server_count: ctx.bot.guilds.size });

    ctx.bot.guilds.forEach(g => {
        g.emojis.forEach(e => {
            e.guild_id = g.id;
            ctx.emotes.set(e.id, e);
        });
    });
});

client.on("guildCreate", function(guild) {
    let bots = 0;
    guild.members.forEach(m => {
        if (m.bot) ++bots;
    });

    ctx.libs.superagent
        .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
        .set("Authorization", ctx.apikeys.dbots)
        .send({ server_count: ctx.bot.guilds.size });
    ctx.utils.logInfo(
        ctx,
        `Joined Guild: '${guild.name}' (${guild.id}) | Percentage: ${Math.floor(
            bots / guild.memberCount * 100
        )}%, Bots: ${bots}, Humans: ${guild.memberCount - bots}, Total: ${
            guild.memberCount
        } | Now in ${ctx.bot.guilds.size} guilds.`
    );

    if (bots >= 50 && Math.floor(bots / guild.memberCount * 100) >= 70) {
        ctx.utils.logInfo(
            ctx,
            `'${guild.name}' (${
                guild.id
            }) detected as a bot collection, leaving!`
        );
        guild.leave();
    }
});

client.on("guildDelete", function(guild) {
    ctx.libs.superagent
        .post(`https://bots.discord.pw/api/bots/${ctx.bot.user.id}/stats`)
        .set("Authorization", ctx.apikeys.dbots)
        .send({ server_count: ctx.bot.guilds.size });
    ctx.utils.logInfo(
        ctx,
        `Left Guild: '${guild.name}' (${guild.id}) | Now in ${
            ctx.bot.guilds.size
        } guilds.`
    );
});

var files = ctx.libs.fs.readdirSync(__dirname + "/cmds");
for (let f of files) {
    let c = require(__dirname + "/cmds/" + f);

    if (c.name && c.func) {
        ctx.cmds.set(c.name, c);
        console.log(`Loaded Command: ${c.name}`);
    } else if (c.length) {
        for (let i = 0; i < c.length; i++) {
            let a = c[i];
            if (a.func && a.name) {
                ctx.cmds.set(a.name, a);
                console.log(`Loaded Command: ${a.name} (${f})`);
            }
        }
    }
}

let createEvent = function(client, e, ctx) {
    if (e.event == "timer") {
        if (!e.interval) {
            console.log(
                `No interval for event: ${e.event +
                    "|" +
                    e.name}, not setting up interval.`
            );
            return;
        }
        ctx.events.get(e.event + "|" + e.name).timer = setInterval(
            e.func,
            e.interval,
            ctx
        );
    } else {
        client.on(e.event, (...args) => e.func(...args, ctx));
    }
};

var files = ctx.libs.fs.readdirSync(__dirname + "/events");
for (let f of files) {
    let e = require(__dirname + "/events/" + f);
    if (e.event && e.func && e.name) {
        ctx.events.set(e.event + "|" + e.name, e);
        createEvent(client, e, ctx);
        console.log(`Loaded event: ${e.event}|${e.name} (${f})`);
    } else if (e.length) {
        for (let i = 0; i < e.length; i++) {
            let a = e[i];
            if (a.event && a.func && a.name) {
                ctx.events.set(a.event + "|" + a.name, a);
                createEvent(client, a, ctx);
                console.log(`Loaded event: ${a.event}|${a.name} (${f})`);
            }
        }
    }
}

client.on("messageCreate", msg => {
    if (msg.author && !msg.author.bot) {
        let prefix = ctx.prefix;
        let prefix2 = ctx.bot.user.mention + " ";
        let hasRan = false;
        let content = msg.content;

        if (content.startsWith(prefix2)) {
            content = content.replace(prefix2, prefix);
        }

        let [cmd, ...args] = content.split(" ");

        let [cmd2, ...args2] = msg.cleanContent.split(" ");

        ctx.cmds.forEach(async c => {
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

                let analytics = await ctx.db.models.analytics.findOne({
                    where: { id: 1 }
                });
                let usage = JSON.parse(analytics.dataValues.cmd_usage);

                usage[c.name] = usage[c.name] ? usage[c.name] + 1 : 1;

                await ctx.db.models.analytics.update(
                    { cmd_usage: JSON.stringify(usage) },
                    { where: { id: 1 } }
                );

                hasRan = true;
            }

            if (
                c.aliases &&
                (cmd == prefix + c.name ||
                    cmd ==
                        prefix +
                            c.aliases.find(
                                a => a == cmd.replace(prefix, "")
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

                let analytics = await ctx.db.models.analytics.findOne({
                    where: { id: 1 }
                });
                let usage = JSON.parse(analytics.dataValues.cmd_usage);

                usage[c.name] = usage[c.name] ? usage[c.name] + 1 : 1;

                await ctx.db.models.analytics.update(
                    { cmd_usage: JSON.stringify(usage) },
                    { where: { id: 1 } }
                );

                hasRan = true;
            }
        });
    }
});

process.on("unhandledRejection", (e, p) => {
    //console.log("Uncaught rejection: "+e.message);
    if (e.length > 1900) {
        ctx.libs.request.post(
            "https://hastebin.com/documents",
            { body: `${e} (${p})` },
            function(err, res, body) {
                if (res.statusCode == 200) {
                    let key = JSON.parse(body).key;
                    ctx.utils.logWarn(
                        ctx,
                        `Uncaught rejection: Output too long to send in a message: https://hastebin.com/${key}.js`
                    );
                } else {
                    ctx.bot
                        .getChannel(logid)
                        .createMessage(
                            ":warning: Cannot upload rejection to Hastebin."
                        );
                }
            }
        );
    } else {
        ctx.utils.logWarn(ctx, `Uncaught rejection: '${e}'`);
    }
});

client.on("error", e => {
    //console.log("Bot error: "+e.message);
    if (e.message.length > 1900) {
        ctx.libs.request.post(
            "https://hastebin.com/documents",
            { body: e.message },
            function(err, res, body) {
                if (res.statusCode == 200) {
                    let key = JSON.parse(body).key;
                    ctx.utils.logWarn(
                        ctx,
                        `Error: Output too long to send in a message: https://hastebin.com/${key}.js`
                    );
                } else {
                    ctx.bot
                        .getChannel(logid)
                        .createMessage(
                            ":warning: Cannot upload error to Hastebin."
                        );
                }
            }
        );
    } else {
        ctx.utils.logWarn(ctx, `Error: '${e.message}'`);
    }
});

client.connect();
