const regex = /(?:\s|^)(gh|gl|gd|owo|sg|teknik|bb|yt|bc|bcu|sc|aur|bot|sw|tw|npm|xkcd)\/([a-zA-Z0-9-_.#/!]*)/g;
const reglinks = {
    gl: "https://gitlab.com/$link$",
    gh: "https://github.com/$link$",
    gd: "https://gitdab.com/$link$",
    owo: "https://owo.codes/$link$",
    sg: "https://git.supernets.org/$link$",
    teknik: "https://git.teknik.io/$link$",
    bb: "https://bitbucket.org/$link$",
    yt: "https://youtu.be/$link$",
    bc: "https://$link$.bandcamp.com/",
    bcu: "https://bandcamp.com/$link$",
    sc: "https://soundcloud.com/$link$",
    aur: "https://aur.archlinux.org/packages/$link$",
    bot: "<https://discordapp.com/oauth2/authorize?client_id=$link$&scope=bot>",
    sw: "https://steamcommunity.com/sharedfiles/filedetails/?id=$link$",
    tw: "https://twitter.com/$link$",
    npm: "https://npmjs.com/package/$link$",
    xkcd: "https://xkcd.com/$link$"
};

let onMessage = async function(msg, ctx) {
    if (!msg) return;
    if (!msg.channel.guild) return;
    if (msg.author.id == ctx.bot.user.id) return;

    const data = await ctx.db.models.sdata.findOrCreate({
        where: { id: msg.channel.guild.id }
    });

    if (msg.author.bot && !data[0].dataValues.funallowed) return;

    const enabled = data[0].dataValues.shortlinks;

    if (enabled) {
        let res = msg.content.match(regex);
        if (!res) return;
        res = res.map(x => (x.startsWith(" ") ? x.substring(1) : x));
        let links = [];

        for (const m in res) {
            for (const x of reglinks.keys()) {
                let url = res[m];
                if (!url.startsWith(x)) return;
                url = url.replace(x + "/", "");

                if (x == "gh" || x == "gl" || x == "gd") {
                    url = url.replace("#", "/issues/");
                }

                if (x == "gl") {
                    url = url.replace("!", "/merge_requests/");
                } else if (x == "gd") {
                    url = url.replace("!", "/pulls/");
                } else if (x == "gh") {
                    url = url.replace("!", "/pull/");
                }

                url = reglinks[x].replace("$link$", url);
                links.push(url);
            }
        }

        msg.channel.createMessage(links.join("\n"));
    }
};

module.exports = {
    event: "messageCreate",
    name: "shortlinks",
    func: onMessage
};
