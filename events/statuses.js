let statuses = [
    { type: 0, name: "on %scount% servers" },
    { type: 0, name: "with %ucount% users" },
    { type: 0, name: "in %ccount% channels" },
    { type: 0, name: "Minecraft 1.8.9" },
    { type: 0, name: "Minecraft 1.12.2" },
    { type: 2, name: "home server noises" },
    { type: 3, name: "you \uD83D\uDC40" },
    //{ type: 0, name: "Need something to eat? Try hf!recipe" },
    { type: 2, name: "OpenMPT" }
];

let setStatus = function(ctx) {
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    status.name = status.name
        .replace("%scount%", ctx.bot.guilds.size)
        .replace("%ucount%", ctx.bot.users.size)
        .replace("%ccount%", Object.keys(ctx.bot.channelGuildMap).length);

    ctx.bot.editStatus("online", {
        type: status.type,
        name: `${status.name} | ${ctx.prefix}help`
    });
};

module.exports = {
    event: "timer",
    name: "statuses",
    interval: 600000,
    func: setStatus
};
