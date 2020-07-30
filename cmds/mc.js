const fs = require("fs");
const namemcLib = require("../utils/namemc.js");
const jimp = require("jimp");
const superagent = require("superagent");

let scol = {
    green: "<:online:493173082421461002>",
    yellow: "<:idle:493173082006093836>",
    red: "<:dnd:493173082261815307>",
};

let stxt = {
    green: "No Issues",
    yellow: "Some Issues",
    red: "**Offline/Unavaliable**",
};

async function mcstatus(ctx, msg, args) {
    let req = await superagent.get("https://status.mojang.com/check");
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
                    inline: true,
                },
                {
                    name: "Mojang Site",
                    value: `${scol[status["mojang.com"]]} ${
                        stxt[status["mojang.com"]]
                    }`,
                    inline: true,
                },
                {
                    name: "Session Server (MC)",
                    value: `${scol[status["session.minecraft.net"]]} ${
                        stxt[status["session.minecraft.net"]]
                    }`,
                    inline: true,
                },
                {
                    name: "Session Server (Mojang)",
                    value: `${scol[status["sessionserver.mojang.com"]]} ${
                        stxt[status["sessionserver.mojang.com"]]
                    }`,
                    inline: true,
                },
                {
                    name: "Skins",
                    value: `${scol[status["textures.minecraft.net"]]} ${
                        stxt[status["textures.minecraft.net"]]
                    }`,
                    inline: true,
                },
                {
                    name: "API",
                    value: `${scol[status["api.mojang.com"]]} ${
                        stxt[status["api.mojang.com"]]
                    }`,
                    inline: true,
                },
                {
                    name: "Mojang Accounts",
                    value: `${scol[status["account.mojang.com"]]} ${
                        stxt[status["account.mojang.com"]]
                    }`,
                    inline: true,
                },
                {
                    name: "Auth Server",
                    value: `${scol[status["authserver.mojang.com"]]} ${
                        stxt[status["authserver.mojang.com"]]
                    }`,
                    inline: true,
                },
            ],
        },
    });
}

let mcserver = async function (ctx, msg, args) {
    args = args.split(" ")[0]; //ignore all other inputs
    let data = await superagent
        .get(`https://api.mcsrvstat.us/1/${args}`)
        .then((x) => x.body);

    let e = {
        title: `Minecraft Server: \`${args}\``,
        fields: [
            {
                name: "Status",
                value: data.offline
                    ? "<:offline:493173082253426688> Offline"
                    : "<:online:493173082421461002> Online",
                inline: true,
            },
        ],
        thumbnail: {
            url: "attachment://icon.png",
        },
        footer: { text: "Powered by mcsrvstat.us" },
    };

    let img = {
        file: fs.readFileSync(`${__dirname}/../img/noicon.png`),
        name: "icon.png",
    };

    if (!data.offline) {
        e.title = `Minecraft Server \`${data.hostname || args}\``;
        e.fields.push({
            name: "MOTD",
            value: data.motd.clean.join("\n"),
            inline: true,
        });
        e.fields.push({
            name:
                "Players" + data.players.list
                    ? ` (${data.players.online}/${data.players.max})`
                    : "",
            value: data.players.list
                ? data.players.list.join(", ")
                : `${data.players.online}/${data.players.max}`,
            inline: true,
        });
        if (data.version)
            e.fields.push({
                name: "Version",
                value: data.version,
                inline: true,
            });
        if (data.software)
            e.fields.push({
                name: "Server Type",
                value: data.software,
                inline: true,
            });
        if (data.plugins && data.plugins.names)
            e.fields.push({
                name: "Plugins",
                value: data.plugins.names.length + " plugins",
                inline: true,
            });
        if (data.mods && data.mods.names)
            e.fields.push({
                name: "Mods",
                value: data.mods.names.length + " mods",
                inline: true,
            });
        if (data.icon) {
            img.file = Buffer.from(
                data.icon.replace(/data:image\/png;base64,/, ""),
                "base64"
            );
        }
    }

    msg.channel.createMessage({ embed: e }, img);
};

const uuidRegex = /[a-fA-F0-9]{8}\-?[a-fA-F0-9]{4}\-?[a-fA-F0-9]{4}\-?[a-fA-F0-9]{4}\-?[a-fA-F0-9]{12}/;
const capeUrlRegex = /--cape="(.+?)" /;

async function namemc(ctx, msg, args) {
    let data;

    let capeUrl = "http://s.optifine.net";

    if (capeUrlRegex.test(args)) {
        let a = args.match(capeUrlRegex);
        capeUrl = a[1];
        args = args.replace(capeUrlRegex, "");
    }

    if (uuidRegex.test(args)) {
        data = await namemcLib.getProfileFromUUID(args);
    } else {
        data = await namemcLib.getProfileFromName(args);
    }

    if (!data) {
        msg.channel.createMessage("No data returned.");
        return;
    }

    let nameHistory = [];

    for (let i in data.nameHistory) {
        let name = data.nameHistory[i];
        let date = name.changedToAt ? new Date(name.changedToAt) : null;
        nameHistory.push(
            `${parseInt(i) + 1}. ${name.name.replace(/_/g, "\\_")}${
                date
                    ? ` - ${date.getUTCDate().toString().padStart(2, "0")}/${(
                          date.getUTCMonth() + 1
                      )
                          .toString()
                          .padStart(
                              2,
                              "0"
                          )}/${date.getUTCFullYear()} @ ${date
                          .getUTCHours()
                          .toString()
                          .padStart(
                              2,
                              "0"
                          )}:${date
                          .getUTCMinutes()
                          .toString()
                          .padStart(
                              2,
                              "0"
                          )}:${date
                          .getUTCSeconds()
                          .toString()
                          .padStart(2, "0")}`
                    : ""
            }`
        );
    }

    nameHistory.reverse();

    let renders = await namemcLib.renderPlayerModelFromUUID(data.uuid, capeUrl);
    let outImg = new jimp(1200, 800);
    let front = await jimp.read(renders.front);
    let back = await jimp.read(renders.back);
    outImg.composite(front, 0, 0);
    outImg.composite(back, 600, 0);
    let file = await outImg.getBufferAsync(jimp.MIME_PNG);

    let embed = {
        color: ctx.utils.pastelize(data.uuid),
        title: data.username.replace(/_/g, "\\_"),
        fields: [
            { name: "UUID", value: data.uuid },
            { name: "Name History", value: nameHistory.join("\n") },
        ],
        image: { url: "attachment://render.png" },
    };

    msg.channel.createMessage(
        { embed: embed },
        { name: "render.png", file: file }
    );
}

module.exports = [
    {
        name: "mcstatus",
        desc: "Minecraft Server Status",
        func: mcstatus,
        usage: "",
        group: "minecraft",
    },
    {
        name: "mcserver",
        desc: "Query a Minecraft server",
        func: mcserver,
        usage: "[ip]",
        group: "minecraft",
    },
    {
        name: "namemc",
        desc: "Get a player's NameMC profile.",
        func: namemc,
        usage: "[username or uuid]",
        group: "minecraft",
    },
];
