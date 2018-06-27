let scol = {
    green: "<:online:313956277808005120>",
    yellow: "<:away:313956277220802560>",
    red: "<:dnd:313956276893646850>"
};

let stxt = {
    green: "No Issues",
    yellow: "Some Issues",
    red: "**Offline/Unavaliable**"
};

let mcstatus = async function(ctx, msg, args) {
    let req = await ctx.libs.superagent.get("https://status.mojang.com/check");
    let status = req.body;
    let tmp = {};
    for (let i = 0; i < status.length; i++) {
        tmp[Object.keys(status[i])[0]] = status[i][Object.keys(status[i])[0]];
    }
    status = tmp;
    tmp = undefined;

    msg.channel.createMessage({
        embed: {
            title: "Minecraft Status",
            fields: [
                {
                    name: "Minecraft Site",
                    value: `${scol[status["minecraft.net"]]} ${
                        stxt[status["minecraft.net"]]
                    }`,
                    inline: true
                },
                {
                    name: "Mojang Site",
                    value: `${scol[status["mojang.com"]]} ${
                        stxt[status["mojang.com"]]
                    }`,
                    inline: true
                },
                {
                    name: "Session Server (MC)",
                    value: `${scol[status["session.minecraft.net"]]} ${
                        stxt[status["session.minecraft.net"]]
                    }`,
                    inline: true
                },
                {
                    name: "Session Server (Mojang)",
                    value: `${scol[status["sessionserver.mojang.com"]]} ${
                        stxt[status["sessionserver.mojang.com"]]
                    }`,
                    inline: true
                },
                {
                    name: "Skins",
                    value: `${scol[status["textures.minecraft.net"]]} ${
                        stxt[status["textures.minecraft.net"]]
                    }`,
                    inline: true
                },
                {
                    name: "API",
                    value: `${scol[status["api.mojang.com"]]} ${
                        stxt[status["api.mojang.com"]]
                    }`,
                    inline: true
                },
                {
                    name: "Mojang Accounts",
                    value: `${scol[status["account.mojang.com"]]} ${
                        stxt[status["account.mojang.com"]]
                    }`,
                    inline: true
                },
                {
                    name: "Auth Server",
                    value: `${scol[status["authserver.mojang.com"]]} ${
                        stxt[status["authserver.mojang.com"]]
                    }`,
                    inline: true
                }
            ]
        }
    });
};

let mcserver = async function(ctx, msg, args) {
    args = args.split(" ")[0]; //ignore all other inputs
    let req = await ctx.libs.superagent.get(
        `https://api.mcsrvstat.us/1/${args}`
    );
    let data = req.body;

    let e = {
        title: `Minecraft Server: \`${args}\``,
        fields: [
            {
                name: "Status",
                value: data.offline
                    ? "<:offline:313956277237710868> Offline"
                    : "<:online:313956277808005120> Online",
                inline: true
            }
        ],
        thumbnail: {
            url: "https://cdn.discordapp.com/emojis/402275812637933598.png?v=1"
        },
        footer: { text: "Powered by mcsrvstat.us" }
    };

    let a = {
        name: "icon.png"
    };

    if (!data.offline) {
        e.title = `Minecraft Server \`${data.hostname || args}\``;
        e.fields.push({
            name: "MOTD",
            value: data.motd.clean.join("\n"),
            inline: true
        });
        e.fields.push({
            name: "Players",
            value: `${data.players.online}/${data.players.max}`,
            inline: true
        });
        e.fields.push({
            name: "Version",
            value: data.version || "Unknown",
            inline: true
        });
        e.fields.push({
            name: "Server Type",
            value: data.software || "Unlisted",
            inline: true
        });
        e.fields.push({
            name: "Plugins",
            value: data.plugins ? data.plugins.names.join(", ") : "Unlisted",
            inline: true
        });
        if (data.icon) {
            e.thumbnail.url = "attachment://icon.png";
            let icon = await ctx.libs.jimp.read(data.icon);
            icon.clone().getBuffer(ctx.libs.jimp.MIME_PNG, (e, f) => {
                a.file = f;
            });
        }
    }

    msg.channel.createMessage({ embed: e, file: a });
};

module.exports = [
    {
        name: "mcstatus",
        desc: "Minecraft Server Status",
        func: mcstatus,
        usage: "",
        group: "minecraft"
    },
    {
        name: "mcserver",
        desc: "Query a Minecraft server",
        func: mcserver,
        usage: "[ip]",
        group: "minecraft"
    }
];
