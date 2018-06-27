/*let messageDelete = function(msg,ctx){
	if(!msg.channel.guild) return;
	ctx.snipes.set(msg.channel.id,msg);
}

let messageUpdate = function(msg,omsg,ctx){
	if(!msg.channel.guild) return;
	if(omsg && msg && omsg.content && msg.content && omsg.content == msg.content) return;
	ctx.esnipes.set(msg.channel.id,{omsg:omsg,msg:msg});
}

module.exports = [
	{
		event:"messageDelete",
		name:"snipe",
		func:messageDelete
	},
	{
		event:"messageUpdate",
		name:"snipe",
		func:messageUpdate
	}
]*/
