let messageCreate = async function(msg,ctx){
    if(!msg) return;
	if(!msg.channel.guild) return;
    if(msg.author.bot) return;

    let wallet = await ctx.db.models.econ.findOne({where:{id:msg.author.id}});
    if(wallet){
        let state = JSON.parse(wallet.state);
            
        if(state.regen < new Date().getTime() && state.points == 0){
            state.points = 3;
        }
        
        if(Math.random() < 0.03){
            let amount = Math.floor(Math.random()*5)+1;

            ctx.db.models.econ.update({currency:wallet.currency + amount,state:JSON.stringify(state)},{where:{id:msg.author.id}});
            ctx.utils.logInfo(ctx,`[ECON] Gave ${msg.author.username}#${msg.author.discriminator} ${amount}FC.`);
            if(msg.channel.permissionsOf(ctx.bot.user.id).has("addReactions") && wallet.noreact === false) msg.addReaction("\uD83D\uDCB8");
        }
    }
}

module.exports = {
    event:"messageCreate",
    name:"economy",
    func:messageCreate
}