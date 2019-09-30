function fmod(a, b) {
    return Number((a - Math.floor(a / b) * b).toPrecision(8));
}

function stringHash(str) {
    let counter = 1;
    let len = str.length;
    for (i = 0; i < len; i = i + 3) {
        counter =
            fmod(counter * 8161, 4294967279) +
            str.charCodeAt(i) * 16776193 +
            (str.charCodeAt(i + 1) || len - i + 256) * 8372226 +
            (str.charCodeAt(i + 2) || len - i + 256) * 3932164;
    }

    return fmod(counter, 4294967291);
}

function hsvToInt(h, s, v) {
    let c = v * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = v - c;

    let r, g, b;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    r += m;
    g += m;
    b += m;

    r *= 255;
    g *= 255;
    b *= 255;

    let out = r;
    out = (out << 8) + g;
    out = (out << 8) + b;

    return out;
}

function pastelize(str) {
    let h = stringHash(str) - 5;

    let light = h % 3 == 0;
    let dark = h % 127 == 0;

    return hsvToInt((h % 180) * 2, light ? 0.3 : 0.6, dark ? 0.6 : 1);
}

function toReadableTime(time) {
    let seconds = time / 1000;
    let days = seconds / 60 / 60 / 24;
    let years = days / 365.25;

    if (years >= 1) {
        return `${years.toFixed(2)} years`;
    } else {
        return `${days.toFixed(2)} days`;
    }
}

let profile = async function(ctx, msg, args) {
    if (!msg.channel.guild) {
        msg.channel.createMessage("Can only be used in guilds.");
        return;
    }

    ctx.utils.lookupUser(ctx, msg, args || msg.author.id).then(async u => {
        if (!msg.channel.guild.members.get(u.id)) {
            msg.channel.createMessage("User not in guild.");
            return;
        }
        u = msg.channel.guild.members.get(u.id);
        let snowflake = parseInt(u.id).toString(2);
        snowflake = "0".repeat(64 - snowflake.length) + snowflake;
        let date = snowflake.substr(0, 42);
        let createdAt = parseInt(date, 2) + 1420070400000;

        let e = {
            color: pastelize(u.username),
            title: `Profile Card: \`${u.username}#${u.discriminator}\` ${
                u.bot ? "<:boat:546212361472835584>" : ""
            }`,
            fields: [
                {
                    name: "Nickname",
                    value: u.nick ? u.nick : "None",
                    inline: true
                },
                {
                    name: "Account Age",
                    value: toReadableTime(Date.now() - createdAt),
                    inline: true
                }
            ],
            thumbnail: {
                url:
                    u.avatar !== null
                        ? `https://cdn.discordapp.com/avatars/${u.id}/${
                              u.avatar
                          }.${
                              u.avatar.startsWith("a_") ? "gif" : "png?size=256"
                          }`
                        : `https://cdn.discordapp.com/embed/avatars/${u.discriminator %
                              5}.png`
            }
        };

        let edata = await ctx.db.models.econ.findOne({
            where: { id: u.id }
        });

        let gdata = await ctx.db.models.econ.findAll();
        let ldata = gdata.filter(x => msg.channel.guild.members.get(x.id));
        let ranks = [];
        let lranks = [];

        for (const d of gdata.values()) {
            ranks.push({ id: d.dataValues.id, amt: d.dataValues.currency });
        }
        for (const d of ldata.values()) {
            lranks.push({ id: d.dataValues.id, amt: d.dataValues.currency });
        }

        ranks.sort((a, b) => b.amt - a.amt);
        lranks.sort((a, b) => b.amt - a.amt);

        let rank = ranks.findIndex(x => x.id === u.id) + 1;
        let lrank = lranks.findIndex(x => x.id === u.id) + 1;

        if (edata) {
            e.fields.push({
                name: "Wallet",
                value: `${edata.currency}FC`,
                inline: true
            });
            e.fields.push({
                name: "Economy Ranking",
                value: `${rank}/${ranks.length} globally, ${lrank}/${lranks.length} locally.`,
                inline: true
            });
            e.fields.push({
                name: "Steal Stats",
                value: `${edata.steals} tries, ${edata.steal_succ} success (${(
                    100 -
                    ((edata.steals - edata.steal_succ) / edata.steals) * 100
                ).toFixed(3)}%)`
            });
        }

        msg.channel.createMessage({
            embed: e
        });
    });
};

module.exports = [
    {
        name: "profile",
        desc: "Less technical user info.",
        func: profile,
        group: "social"
    }
];
