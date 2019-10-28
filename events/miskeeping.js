async function paulBlart(msg, ctx) {
    if (
        msg.channel.id == "625876101826084895" &&
        msg.channel.permissionsOf(ctx.bot.user.id).has("manageMessages")
    ) {
        let m = msg.channel.getMessages(1, msg.id).then(x => x[0]);
        if (msg.author.id == m.author.id) msg.delete().catch(_ => {});
        if (msg.content !== "Paul Blart") msg.delete().catch(_ => {});
    }
}

module.exports = [
    {
        event: "messageCreate",
        name: "PaulBlart",
        func: paulBlart
    }
];
