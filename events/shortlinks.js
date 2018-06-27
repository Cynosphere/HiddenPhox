let gh = new RegExp("gh/(.+)/(.+)$");
let gl = new RegExp("gl/(.+)/(.+)$");
let bot = new RegExp("bot:([0-9]{17,21})$");
let sw = new RegExp("sw:([0-9]{1,10})$");

let onMessage = async function(msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;
    if (msg.author.bot) return;

    let data = await ctx.db.models.sdata.findOrCreate({
        where: { id: msg.channel.guild.id }
    });
    let enabled = data[0].dataValues.shortlinks;

    if (enabled) {
        if (gh.test(msg.content)) {
            let args = msg.content.match(gh);
            msg.channel.createMessage(
                `https://github.com/${args[1]}/${args[2]}`
            );
        } else if (gl.test(msg.content)) {
            let args = msg.content.match(gl);
            msg.channel.createMessage(
                `https://gitlab.com/${args[1]}/${args[2]}`
            );
        } else if (bot.test(msg.content)) {
            let args = msg.content.match(bot);
            msg.channel.createMessage(
                `<https://discordapp.com/oauth2/authorize?client_id=${
                    args[1]
                }&scope=bot>`
            );
            ctx.cmds.get("binfo").func(ctx, msg, args[1]);
        } else if (sw.test(msg.content)) {
            let args = msg.content.match(sw);
            msg.channel.createMessage(
                `https://steamcommunity.com/sharedfiles/filedetails/?id=${
                    args[1]
                }`
            );
        }
    }
};

module.exports = {
    event: "messageCreate",
    name: "shortlinks",
    func: onMessage
};
