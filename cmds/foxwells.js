const superagent = require("superagent");

async function webcam(ctx, msg, args) {
    const f = await superagent
        .get(`https://homeproxy.utsuho.rocks/webcamout/out.jpg`)
        .buffer()
        .then(x => x.body);
    msg.channel.createMessage("", { file: f, name: "pbn.jpg" });
}

/*let lighton = async function(ctx, msg, args) {
    let rl = ctx.ratelimits.get(msg.author.id);
    if (rl && rl.adryd && rl.adryd > Date.now()) {
        msg.channel.createMessage(
            `Ratelimited. Try again in ${ctx.utils.remainingTime(
                new Date(rl.adryd) - Date.now()
            )}.`
        );
        return;
    }

    superagent
        .post(
            "https://maker.ifttt.com/trigger/dab/with/key/dCaeTmnYoY-y6d7-lqZAam"
        )
        .set("Content-Type", "application/json")
        .send({ value1: "ffffff" })
        .then(async x => {
            if (x.statusCode == 200) {
                let c = await ctx.bot.guilds
                    .get("343947907264806912")
                    .channels.get("451213900009177088");
                c.createMessage(
                    `<:away:313956277220802560> **${msg.author.username}#${
                        msg.author.discriminator
                    }** \`(${msg.author.id})\` turned on your lights.`
                );
                msg.addReaction("\uD83D\uDC4C");
            } else {
                msg.channel.createMessage(
                    "An errored occured, try again later."
                );
            }
        });

    if (rl) {
        rl.adryd = Date.now() + 30000;
        ctx.ratelimits.set(msg.author.id, rl);
    } else {
        ctx.ratelimits.set(msg.author.id, { adryd: Date.now() + 30000 });
    }
};

let lightoff = async function(ctx, msg, args) {
    let rl = ctx.ratelimits.get(msg.author.id);
    if (rl && rl.adryd && rl.adryd > Date.now()) {
        msg.channel.createMessage(
            `Ratelimited. Try again in ${ctx.utils.remainingTime(
                new Date(rl.adryd) - Date.now()
            )}.`
        );
        return;
    }

    superagent
        .post(
            "https://maker.ifttt.com/trigger/dab/with/key/dCaeTmnYoY-y6d7-lqZAam"
        )
        .set("Content-Type", "application/json")
        .send({ value1: "000000" })
        .then(async x => {
            if (x.statusCode == 200) {
                let c = await ctx.bot.guilds
                    .get("343947907264806912")
                    .channels.get("451213900009177088");
                c.createMessage(
                    `<:offline:313956277237710868> **${msg.author.username}#${
                        msg.author.discriminator
                    }** \`(${msg.author.id})\` turned on your lights.`
                );
                msg.addReaction("\uD83D\uDC4C");
            } else {
                msg.channel.createMessage(
                    "An errored occured, try again later."
                );
            }
        });

    if (rl) {
        rl.adryd = Date.now() + 30000;
        ctx.ratelimits.set(msg.author.id, rl);
    } else {
        ctx.ratelimits.set(msg.author.id, { adryd: Date.now() + 30000 });
    }
};

let lightcol = async function(ctx, msg, args) {
    let rl = ctx.ratelimits.get(msg.author.id);
    if (rl && rl.adryd && rl.adryd > Date.now()) {
        msg.channel.createMessage(
            `Ratelimited. Try again in ${ctx.utils.remainingTime(
                new Date(rl.adryd) - Date.now()
            )}.`
        );
        return;
    }

    let isCol = /#?[0-9a-fA-F]{3,6}/.test(args);
    let col = args.match(/#?[0-9a-fA-F]{3,6}/);

    if (!isCol) {
        msg.channel.createMessage(
            `Invalid color value. Must be in hex format.`
        );
        return;
    }

    superagent
        .post(
            "https://maker.ifttt.com/trigger/dab/with/key/dCaeTmnYoY-y6d7-lqZAam"
        )
        .set("Content-Type", "application/json")
        .send({ value1: col.toString().replace("#", "") })
        .then(async x => {
            if (x.statusCode == 200) {
                let c = await ctx.bot.guilds
                    .get("343947907264806912")
                    .channels.get("451213900009177088");
                c.createMessage(
                    `:paintbrush: **${msg.author.username}#${
                        msg.author.discriminator
                    }** \`(${msg.author.id})\` made your lights ${col}.`
                );
                msg.addReaction("\uD83D\uDC4C");
            } else {
                msg.channel.createMessage(
                    "An errored occured, try again later."
                );
            }
        });

    if (rl) {
        rl.adryd = Date.now() + 30000;
        ctx.ratelimits.set(msg.author.id, rl);
    } else {
        ctx.ratelimits.set(msg.author.id, { adryd: Date.now() + 30000 });
    }
};*/

module.exports = [
    {
        name: "pbn",
        desc: "Paint By Numbers webcam",
        func: webcam,
        group: "Guild Specific"
        /*guild: [
            "487633770200039426",
            "300436792916836352"
            // "423137607682228234"
        ]*/
    }
    /*{
        name: "alighton",
        desc: "Turn Adryd's lights on.",
        func: lighton,
        group: "Guild Specific",
        guild: [
            "216292020371718146",
            "343947907264806912",
            "423137607682228234"
        ]
    },
    {
        name: "alightoff",
        desc: "Turn Adryd's lights off.",
        func: lightoff,
        group: "Guild Specific",
        guild: [
            "216292020371718146",
            "343947907264806912",
            "423137607682228234"
        ]
    },
    {
        name: "alightcol",
        desc: "Change Adryd's light color.",
        func: lightcol,
        group: "Guild Specific",
        guild: [
            "216292020371718146",
            "343947907264806912",
            "423137607682228234"
        ]
    }*/
];
