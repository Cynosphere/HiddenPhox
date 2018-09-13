const hasteRegex = /^(https?:\/\/)?(www\.)?(hastebin\.com|mystb\.in)\/(raw\/)?([a-z]+)(\.[a-z]+)?$/;

let _eval = async function(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid || ctx.elevated.includes(msg.author.id)) {
        let errored = false;
        let out;
        let isURL = false;

        if (hasteRegex.test(args)) {
            let url = args.match(hasteRegex);
            args = `${url[1]}${url[3]}/raw/${url[5]}`;
            isURL = true;
        }

        if (isURL) {
            let toRun = await ctx.libs.superagent.get(args).then(x => x.text);

            try {
                out = eval(toRun);
                if (out && out.then)
                    out = await out.catch(e => {
                        out = e.message;
                        errored = true;
                    });
            } catch (e) {
                out = e.message;
                errored = true;
            }
        } else {
            try {
                out = eval(args);
                if (out && out.then)
                    out = await out.catch(e => {
                        out = e.message;
                        errored = true;
                    });
            } catch (e) {
                out = e.message;
                errored = true;
            }
        }

        out =
            typeof out == "string"
                ? out
                : require("util").inspect(out, { depth: 0 });

        out = out.replace(ctx.bot.token, "lol no key 4 u");

        if (errored) {
            msg.channel.createMessage(
                ":warning: Output (errored):\n```js\n" + out + "\n```"
            );
        } else {
            if (out.toString().length > 1980) {
                let output = out.toString();
                ctx.libs.superagent
                    .post("http://mystb.in/documents")
                    .send(output)
                    .then(res => {
                        let key = res.body.key;
                        msg.channel.createMessage(
                            `\u2705 Output too long to send in a message: http://mystb.in/${key}.js`
                        );
                    })
                    .catch(e => {
                        msg.channel.createMessage(
                            `Could not upload output to Mystbin.`
                        );
                    });
            } else {
                msg.channel.createMessage(
                    "\u2705 Output:\n```js\n" + out + "\n```"
                );
            }
        }
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
};

let restart = function(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid) {
        msg.channel.createMessage(`Restarting ${ctx.bot.user.username}...`);
        setTimeout(process.exit, 500);
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
};

let reload = function(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid) {
        if (ctx.libs.fs.existsSync(__dirname + "/" + args + ".js")) {
            try {
                let c = ctx.libs.reload(__dirname + "/" + args + ".js");

                if (c.name && c.func) {
                    ctx.cmds.set(c.name, c);
                } else if (c.length) {
                    for (let i = 0; i < c.length; i++) {
                        let a = c[i];
                        if (a.func && a.name) {
                            ctx.cmds.set(a.name, a);
                        }
                    }
                }
                msg.addReaction("\uD83D\uDC4C");
            } catch (e) {
                msg.channel.createMessage(
                    `:warning: Error reloading: \`\`\`${e.stack}\`\`\``
                );
            }
        } else {
            msg.channel.createMessage("Command not found.");
        }
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
};

let ereload = function(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid) {
        if (ctx.libs.fs.existsSync(__dirname + "/../events/" + args + ".js")) {
            try {
                let e = ctx.libs.reload(
                    __dirname + "/../events/" + args + ".js"
                );

                if (e.event && e.func && e.name) {
                    let _e = ctx.events.get(e.event + "|" + e.name);
                    if (_e) ctx.bot.removeListener(_e.event, _e.func);
                    ctx.events.set(e.event + "|" + e.name, e);
                    ctx.utils.createEvent(ctx.bot, e.event, e.func, ctx);
                    ctx.utils.logInfo(
                        ctx,
                        `Reloaded event: ${e.event}|${e.name} (${args})`
                    );
                } else if (e.length) {
                    for (let i = 0; i < e.length; i++) {
                        let a = e[i];
                        if (a.event && a.func && a.name) {
                            let _e = ctx.events.get(a.event + "|" + a.name);
                            if (_e) ctx.bot.removeListener(a.event, _e.func);
                            ctx.events.set(a.event + "|" + a.name, a);
                            ctx.utils.createEvent(
                                ctx.bot,
                                a.event,
                                a.func,
                                ctx
                            );
                            ctx.utils.logInfo(
                                ctx,
                                `Reloaded event: ${a.event}|${a.name} (${args})`
                            );
                        }
                    }
                }
                msg.addReaction("\uD83D\uDC4C");
            } catch (e) {
                msg.channel.createMessage(
                    `:warning: Error reloading: \`${e.message}\``
                );
            }
        } else {
            msg.channel.createMessage("Event not found.");
        }
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
};

let exec = function(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid || ctx.elevated.includes(msg.author.id)) {
        args = args.replace(/rm \-rf/g, "echo");
        require("child_process").exec(args, (e, out, err) => {
            if (e) {
                msg.channel.createMessage("Error\n```" + e + "```");
            } else {
                if (out.toString().length > 1980) {
                    let output = out.toString();
                    ctx.libs.superagent
                        .post("http://mystb.in/documents")
                        .send(output)
                        .then(res => {
                            let key = res.body.key;
                            msg.channel.createMessage(
                                `\u2705 Output too long to send in a message: http://mystb.in/${key}.js`
                            );
                        })
                        .catch(e => {
                            msg.channel.createMessage(
                                `Could not upload output to Mystbin.`
                            );
                        });
                } else {
                    msg.channel.createMessage(
                        "\u2705 Output:\n```bash\n" + out + "\n```"
                    );
                }
            }
        });
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
};

let setav = async function(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid) {
        let url;
        if (args && args.indexOf("http") > -1) {
            url = args;
        } else if (msg.attachments.length > 0) {
            url = msg.attachments[0].url;
        } else {
            msg.channel.createMessage(
                "Image not found. Please give URL or attachment."
            );
            return;
        }

        let req = await ctx.libs.request.get(url);

        let data = `data:${res.headers["content-type"]};base64${new Buffer(
            req.text
        ).toString("base64")}`;
        ctx.bot.editSelf({ avatar: data }).then(() => {
            msg.channel.createMessage(
                emoji.get(":white_check_mark:") + " Avatar set."
            );
        });
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
};

module.exports = [
    {
        name: "eval",
        desc: "JS Eval",
        fulldesc: "Evaluate JavaScript code at runtime",
        func: _eval,
        usage: "<string>",
        group: "bot"
    },
    {
        name: "restart",
        desc: "Restarts bot",
        func: restart,
        group: "bot"
    },
    {
        name: "reload",
        desc: "Reloads a command",
        func: reload,
        usage: "<command>",
        group: "bot"
    },
    {
        name: "ereload",
        desc: "Reloads a set of events",
        func: ereload,
        usage: "<event>",
        group: "bot"
    },
    {
        name: "exec",
        desc: "Bash.",
        func: exec,
        usage: "<command>",
        group: "bot"
    },
    {
        name: "setavatar",
        desc: "Sets bot's avatar.",
        func: setav,
        usage: "<url/attachment>",
        group: "bot"
    }
];
