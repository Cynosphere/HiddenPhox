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

async function getTweetImages(ctx, snowflake) {
    return new Promise(async (resolve, reject) => {
        let token = await getBearer(ctx);

        let imgs = [];

        let tweet = ctx.libs.superagent
            .get(
                `https://api.twitter.com/1.1/statuses/show.json?id=${snowflake}&trim_user=1&include_entities=1`
            )
            .set("Authorization", `Bearer ${token}`)
            .then(x => x.body);
        let media = tweet.extended_entities.media.splice(1);

        for (m in media) {
            imgs.push(media[m].media_url_https + ":orig");
        }

        resolve(imgs);
    });
}

let onMessage = async function(msg, ctx) {
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
        let imgs = await getTweetImages(ctx, id);

        if (imgs.length > 0) {
            msg.channel.createMessage(imgs.join("\n"));
        }
    }
};

module.exports = {
    event: "messageCreate",
    name: "twimg",
    func: onMessage
};
