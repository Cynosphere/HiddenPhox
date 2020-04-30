const reqreload = require("require-reload")(require);
const fs = require("fs");
const superagent = require("superagent");

const hasteRegex = /^(https?:\/\/)?(www\.)?(hastebin\.com|mystb\.in)\/(raw\/)?([a-z]+)(\.[a-z]+)?$/;

async function _eval(ctx, msg, args) {
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
            let toRun = await superagent.get(args).then((x) => x.text);

            try {
                out = eval(toRun);
                if (out && out.then) out = await out;
            } catch (err) {
                out = err.message ? err.message : err;
                errored = true;
            }
        } else {
            try {
                out = eval(args);
                if (out && out.then) out = await out;
            } catch (err) {
                out = err.message ? err.message : err;
                errored = true;
            }
        }

        out =
            typeof out == "string"
                ? out
                : require("util").inspect(out, { depth: 0 });

        let token = ctx.bot.token;
        out = out.replace(
            new RegExp(token.replace(/\./g, "\\."), "g"),
            "lol no key 4 u"
        );

        if (errored) {
            msg.channel.createMessage(
                ":warning: Output (errored):\n```js\n" + out + "\n```"
            );
        } else {
            if (out.toString().length > 1980) {
                let output = out.toString();
                ctx.utils.makeHaste(
                    ctx,
                    msg,
                    output,
                    "\u2705 Output too long to send in a message: "
                );
            } else {
                msg.channel.createMessage(
                    "\u2705 Output:\n```js\n" + out + "\n```"
                );
            }
        }
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
}

function restart(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid) {
        msg.addReaction("\uD83D\uDD04");
        setTimeout(process.exit, 500);
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
}

function reload(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid) {
        if (fs.existsSync(`${__dirname}/${args}.js`)) {
            try {
                const oldCmd = reqreload(`${__dirname}/${args}.js`);

                if (oldCmd.name && oldCmd.func) {
                    ctx.cmds.set(oldCmd.name, oldCmd);
                } else if (oldCmd.length) {
                    for (const i = 0; i < oldCmd.length; i++) {
                        const subCmd = oldCmd[i];
                        if (subCmd.func && subCmd.name) {
                            ctx.cmds.set(subCmd.name, subCmd);
                        }
                    }
                }
                msg.addReaction("\uD83D\uDC4C");
            } catch (err) {
                msg.channel.createMessage(
                    `:warning: Error reloading: \`\`\`\n${err.stack}\n\`\`\``
                );
            }
        } else {
            msg.channel.createMessage("Command not found.");
        }
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
}

function ereload(ctx, msg, args) {
    if (msg.author.id !== ctx.ownerid) {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
        return;
    }

    if (!fs.existsSync(`${__dirname}/../events/${args}.js`)) {
        msg.channel.createMessage("Event not found.");
        return;
    }

    function reloadEvent(event) {
        const eventName = event.event + "|" + event.name;
        const oldEvent = ctx.events.get(eventName);
        if (oldEvent) {
            if (oldEvent.event == "timer") {
                clearInterval(oldEvent.timer);
            } else {
                ctx.bot.removeListener(oldEvent.event, oldEvent.func);
            }
        }

        ctx.events.set(eventName, event);
        ctx.utils.createEvent(ctx.bot, event.event, event.func, ctx);
        ctx.utils.logInfo(ctx, `Reloaded event: ${eventName} (${args})`);
    }

    try {
        const newEvent = reqreload(`${__dirname}/../events/${args}.js`);

        if (newEvent.event && newEvent.func && newEvent.name) {
            reloadEvent(newEvent);
        } else if (newEvent.length > 0) {
            for (const subEvent of newEvent) {
                reloadEvent(subEvent);
            }
        }
        msg.addReaction("\uD83D\uDC4C");
    } catch (err) {
        msg.channel.createMessage(
            `:warning: Error reloading: \`\`\`\n${err.message}\n\`\`\``
        );
    }
}

function exec(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid || ctx.elevated.includes(msg.author.id)) {
        args = args.replace(/rm \-rf/g, "echo");
        require("child_process").exec(args, (e, out, err) => {
            if (e) {
                if (err.toString().length > 1980) {
                    let output = err.toString();
                    ctx.utils.makeHaste(
                        ctx,
                        msg,
                        output,
                        "\u2705 Output too long to send in a message: "
                    );
                } else {
                    msg.channel.createMessage(`Error:\n\`\`\`\n${err}\n\`\`\``);
                }
            } else {
                if (out.toString().length > 1980) {
                    let output = out.toString();
                    ctx.utils.makeHaste(
                        ctx,
                        msg,
                        output,
                        "\u2705 Output too long to send in a message: "
                    );
                } else {
                    msg.channel.createMessage(
                        `\u2705 Output:\n\`\`\`bash\n${out}\n\`\`\``
                    );
                }
            }
        });
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
}

async function setav(ctx, msg, args) {
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

        let req = await superagent.get(url);

        let data = `data:${req.type};base64${Buffer.from(req.body).toString(
            "base64"
        )}`;
        ctx.bot.editSelf({ avatar: data }).then(() => {
            msg.channel.createMessage(
                "<:ms_tick:503341995348066313> Avatar set."
            );
        });
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
}

async function pprefix(ctx, msg, args) {
    args = ctx.utils.formatArgs(args);
    if (args && args[0] == "set") {
        let pre = args[1];
        try {
            let find = await ctx.db.models.udata.findOrCreate({
                where: { id: msg.author.id },
            });
            if (find) {
                await ctx.db.models.udata.update(
                    { prefix: pre },
                    {
                        where: { id: msg.author.id },
                    }
                );
                msg.channel.createMessage(
                    pre == ""
                        ? "Disabled personal prefix"
                        : `Set personal prefix to \`${pre}\`.`
                );
            }
        } catch (e) {
            msg.channel.createMessage("Could not set prefix, try again later.");
            ctx.utils.logWarn(ctx, e);
        }
    } else {
        let out = await ctx.db.models.udata
            .findOrCreate({ where: { id: msg.author.id } })
            .then((x) => x[0].dataValues.prefix);
        msg.channel.createMessage(
            `<@${msg.author.id}>, ` +
                (out == ""
                    ? "You have no personal prefix set."
                    : `Your personal prefix is \`${out}\``)
        );
    }
}

async function funmode(ctx, msg, args) {
    if (msg.author.id === ctx.ownerid) {
        if (!msg.channel.guild) {
            msg.channel.createMessage("Not in guild.");
            return;
        }

        let data = await ctx.db.models.sdata.findOrCreate({
            where: { id: msg.channel.guild.id },
        });
        if (data) {
            let state = !data[0].dataValues.funallowed;
            await ctx.db.models.sdata.update(
                {
                    funallowed: state,
                },
                {
                    where: { id: msg.channel.guild.id },
                }
            );
            msg.channel.createMessage(state == true ? ":)" : ":(");
        }
    } else {
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
}

module.exports = [
    {
        name: "eval",
        desc: "JS Eval",
        fulldesc: "Evaluate JavaScript code at runtime",
        func: _eval,
        usage: "<string>",
        group: "bot",
    },
    {
        name: "restart",
        desc: "Restarts bot",
        func: restart,
        group: "bot",
    },
    {
        name: "reload",
        desc: "Reloads a command",
        func: reload,
        usage: "<command>",
        group: "bot",
    },
    {
        name: "ereload",
        desc: "Reloads a set of events",
        func: ereload,
        usage: "<event>",
        group: "bot",
    },
    {
        name: "exec",
        desc: "Bash.",
        func: exec,
        usage: "<command>",
        group: "bot",
    },
    {
        name: "setavatar",
        desc: "Sets bot's avatar.",
        func: setav,
        usage: "<url/attachment>",
        group: "bot",
    },
    {
        name: "pprefix",
        desc: "Sets your personal prefix to use with the bot.",
        func: pprefix,
        usage: "[set] [prefix]",
        group: "bot",
    },
    {
        name: "funmode",
        desc: "its a secret",
        func: funmode,
        group: "bot",
    },
];
