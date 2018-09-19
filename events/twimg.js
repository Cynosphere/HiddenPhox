const twitterurl = /(?:\s|^)https?:\/\/(www\.)?twitter\.com\/.+\/status\/([0-9]{17,21})/g;

// don't complain at me, do not PR for removal
// taken from https://gist.github.com/shobotch/5160017
// exact key: Twitter for Google TV
const twiKey = Buffer.from(
    "iAtYJ4HpUVfIUoNnif1DA:172fOpzuZoYzNYaU3mMYvE8m8MEyLbztOdbrUolU"
).toString("base64");

async function getBearer(ctx) {
    return new Promise(async (resolve, reject) => {
        let token = await ctx.libs.superagent
            .post(
                "https://api.twitter.com/oauth2/token?grant_type=client_credentials"
            )
            .set("Authorization", `Basic ${twiKey}`)
            .then(x => x.body.access_token);

        resolve(token);
    });
}

async function getTweetImages(ctx, snowflake, msg) {
    return new Promise(async (resolve, reject) => {
        let token = await getBearer(ctx);

        let imgs = [];

        let tweet = await ctx.libs.superagent
            .get(
                `https://api.twitter.com/1.1/statuses/show.json?id=${snowflake}&trim_user=1&include_entities=1`
            )
            .set("Authorization", `Bearer ${token}`)
            .then(x => x.body);
        if (tweet.extended_entities) {
            if (
                tweet.extended_entities.media[0].type == "video" ||
                tweet.extended_entities.media[0].type == "animated_gif"
            ) {
                let vid = tweet.extended_entities.media[0];
                msg.channel.createMessage({
                    embed: {
                        description: `[Twitter Video/GIF File](${
                            vid.video_info.variants[0].url
                        })`
                    }
                });
            }

            let media = tweet.extended_entities.media.splice(1);

            for (m in media) {
                imgs.push(media[m].media_url_https + ":orig");
            }
        }

        resolve(imgs);
    });
}

let twimg = async function(msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;
    if (msg.author.bot) return;

    const enabled = await ctx.db.models.sdata
        .findOrCreate({
            where: { id: msg.channel.guild.id }
        })
        .then(x => x[0].dataValues.twimg);

    if (enabled) {
        let url = msg.content.match(twitterurl);
        if (!url) return;
        url = url.map(x => (x.startsWith(" ") ? x.substring(1) : x))[0];

        let id = url.match(/[0-9]{17,21}$/)[0];
        let imgs = await getTweetImages(ctx, id, msg);

        if (imgs.length > 0) {
            msg.channel.createMessage(imgs.join("\n"));
        }
    }
};

//fediimg
const fediurl = /(?:\s|^)https?:\/\/([^:\/\s]+)\/(@([a-zA-Z0-9-_/]*)\/([0-9]{17,21}))?((objects|notice)\/([a-zA-Z0-9-_/]*))?/;

async function getMastoImages(ctx, url, masto = false, msg) {
    return new Promise(async (resolve, reject) => {
        let imgs = [];

        let post = await ctx.libs.superagent
            .get(`${url}${masto ? ".json" : ""}`)
            .set("Accept", "application/activity+json")
            .then(x => x.body);
        if (post.attachments) {
            let vids = [];

            let cw = post.sensitive;
            let warning = post.summary;

            for (v in post.attachments) {
                let vid = post.attachments[v];

                if (vid.mediaType == "video/mp4") {
                    vids.push(vid.url);
                }
            }

            if (vids.length > 0) {
                msg.channel.createMessage({
                    embed: {
                        title: "Video/GIF URLs",
                        description:
                            `${cw ? `**Content Warning:** ${warning}\n` : ""}` +
                            vids.map(x => `- [Video](${x})`).join("\n")
                    }
                });
            }

            let media = post.attachments.splice(1);

            for (m in media) {
                if (cw) break;
                imgs.push(media[m].url);
            }
        }

        resolve(imgs);
    });
}

let fediimg = async function(msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;
    if (msg.author.bot) return;

    const enabled = await ctx.db.models.sdata
        .findOrCreate({
            where: { id: msg.channel.guild.id }
        })
        .then(x => x[0].dataValues.twimg);

    if (enabled) {
        let url = msg.content.match(fediurl)[0];
        if (!url) return;
        url = url.startsWith(" ") ? url.substring(1) : url;

        let masto = /[0-9]{17,21}$/.test(url);
        let imgs = await getMastoImages(ctx, url, masto, msg);

        if (imgs.length > 0) {
            msg.channel.createMessage(imgs.join("\n"));
        }
    }
};

module.exports = [
    {
        event: "messageCreate",
        name: "twimg",
        func: twimg
    },
    {
        event: "messageCreate",
        name: "fediimg",
        func: fediimg
    }
];
