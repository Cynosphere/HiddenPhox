async function paulBlart(msg, ctx) {
    if (
        msg.channel.id == "625876101826084895" &&
        msg.content !== "Paul Blart" &&
        msg.channel.permissionsOf(ctx.bot.user.id).has("manageMessages")
    ) {
        msg.delete().catch(_ => {});
    }
}

module.exports = [
    {
        event: "messageCreate",
        name: "PaulBlart",
        func: paulBlart
    }
];
