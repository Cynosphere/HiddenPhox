let statuses = [
    { type: 0, name: "on %scount% servers" },
    { type: 0, name: "with %ucount% users" },
    { type: 0, name: "Minecraft 1.8.9" },
    { type: 0, name: "Minecraft 1.7.10" },
    { type: 2, name: "to server room noises" },
    { type: 3, name: "you \uD83D\uDC40" },
    { type: 3, name: "SimpleFlips, eediot" },
    { type: 0, name: "with your mind" },
    { type: 0, name: "Super BUP 64" },
    { type: 0, name: "with cute blobs uwu" },
    { type: 0, name: "Need something to eat? Try hf!recipe" },
    { type: 0, name: "Pants Pants Revolution" },
    { type: 2, name: "1, 2 Oatmeal on a loop" }
];

let setStatus = function(ctx) {
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    status.name = status.name
        .replace("%scount%", ctx.bot.guilds.size)
        .replace("%ucount%", ctx.bot.users.size);

    ctx.bot.editStatus("online", {
        type: status.type,
        name: status.name + " | hf!help"
    });
};

module.exports = {
    event: "timer",
    name: "statuses",
    interval: 600000,
    func: setStatus
};
