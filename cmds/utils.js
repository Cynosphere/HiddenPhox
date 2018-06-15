let statusIcons = {
    online:"<:online:313956277808005120>",
    idle:"<:away:313956277220802560>",
    dnd:"<:dnd:313956276893646850>",
    offline:"<:offline:313956277237710868>"
};

let elevated = [
    "132297363233570816",
    "151344471957569536"
];

let _eval = async function(ctx,msg,args){
    if(msg.author.id === ctx.ownerid || elevated.includes(msg.author.id)){
        let errored = false;
        let out;

        try{
            out = eval(args);
            if(out && out.then) out = await out;
        }catch(e){
            out = e.message;
            errored = true;
        }

        out = typeof out == "string" ? out : require("util").inspect(out,{depth:0});

        out = out.replace(ctx.bot.token,"lol no key 4 u");

        if(errored){
            msg.channel.createMessage(":warning: Output (errored):\n```js\n"+out+"\n```");
        }else{
            if ((out.toString()).length > 1980){
                let output = out.toString();
                ctx.libs.superagent.post("https://hastebin.com/documents")
                .send(output)
                .then(res=>{
                    let key = res.body.key;
                    msg.channel.createMessage(`\u2705 Output too long to send in a message: https://hastebin.com/${key}.js`);
                })
                .catch(e=>{
                    msg.channel.createMessage(`Could not upload output to Hastebin.`);
                });
            }else{
                msg.channel.createMessage("\u2705 Output:\n```js\n"+out+"\n```");
            }
        }
    }else{
        msg.channel.createMessage("No\n\nSent from my iPhone.");
    }
}

let restart = function(ctx,msg,args){
    if(msg.author.id === ctx.ownerid){
        msg.channel.createMessage(`Restarting ${ctx.bot.user.username}...`);
        setTimeout(process.exit,500);
    }else{
        msg.channel.createMessage("No permission.");
    }
}

let reload = function (ctx, msg, args) {
    if (msg.author.id === ctx.ownerid) {
        if (ctx.libs.fs.existsSync(__dirname + "/" + args + ".js")) {
            try {
                let c = ctx.libs.reload(__dirname + "/" + args + ".js");

                if (c.name && c.func) {
                    ctx.cmds.set(c.name, c);
                } else if (c.length) {
                    for (let i = 0; i < c.length; i++) {
                        let a = c[i];
                        if (a.func && a.name) {
                            ctx.cmds.set(a.name, a);
                        }
                    }
                }
                msg.addReaction("\uD83D\uDC4C");
            } catch (e) {
                msg.channel.createMessage(`:warning: Error reloading: \`\`\`${e.stack}\`\`\``);
            }
        } else {
            msg.channel.createMessage("Command not found.");
        }
    } else {
        msg.channel.createMessage("No permission.");
    }
}

let ereload = function(ctx,msg,args){
    if (msg.author.id === ctx.ownerid) {
        if (ctx.libs.fs.existsSync(__dirname + "/../events/" + args + ".js")) {
            try {
                let e = ctx.libs.reload(__dirname + "/../events/" + args + ".js");

                if(e.event && e.func && e.name){
                    let _e = ctx.events.get(e.event+"|"+e.name);
                    if(_e) ctx.bot.removeListener(_e.event,_e.func);
                    ctx.events.set(e.event+"|"+e.name,e);
                    ctx.utils.createEvent(ctx.bot,e.event,e.func,ctx);
                    ctx.utils.logInfo(ctx,`Reloaded event: ${e.event}|${e.name} (${args})`);
                }else if(e.length){
                    for(let i=0;i<e.length;i++){
                        let a = e[i];
                        if(a.event && a.func && a.name){
                            let _e = ctx.events.get(a.event+"|"+a.name);
                            if(_e) ctx.bot.removeListener(a.event,_e.func);
                            ctx.events.set(a.event+"|"+a.name,a);
                            ctx.utils.createEvent(ctx.bot,a.event,a.func,ctx);
                            ctx.utils.logInfo(ctx,`Reloaded event: ${a.event}|${a.name} (${args})`);
                        }
                    }
                }
                msg.addReaction("\uD83D\uDC4C");
            } catch (e) {
                msg.channel.createMessage(`:warning: Error reloading: \`${e.message}\``);
            }
        } else {
            msg.channel.createMessage("Event not found.");
        }
    } else {
        msg.channel.createMessage("No permission.");
    }
}

let exec = function(ctx,msg,args){
    if(msg.author.id === ctx.ownerid || elevated.includes(msg.author.id)){
        args = args.replace(/rm \-rf/g,"echo")
        require('child_process').exec(args,(e,out,err)=>{
            if(e){
                msg.channel.createMessage("Error\n```"+e+"```");
            }else{
                if ((out.toString()).length > 1980){
                    let output = out.toString();
                    ctx.libs.superagent.post("https://hastebin.com/documents")
                    .send(output)
                    .then(res=>{
                        let key = res.body.key;
                        msg.channel.createMessage(`\u2705 Output too long to send in a message: https://hastebin.com/${key}.js`);
                    })
                    .catch(e=>{
                        msg.channel.createMessage(`Could not upload output to Hastebin.`);
                    });
                }else{
                    msg.channel.createMessage("\u2705 Output:\n```bash\n"+out+"\n```");
                }
            }
        });
    }else{
        msg.channel.createMessage("No permission.");
    }
}

let avatar = function(ctx,msg,args){
    ctx.utils.lookupUser(ctx,msg,args ? args : msg.author.mention)
    .then(u=>{
        let av = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${(u.avatar.startsWith("a_") ? "gif?size=1024&_=.gif" : "png?size=1024")}`;
        msg.channel.createMessage({embed:{title:`Avatar for **${u.username}#${u.discriminator}**:`,image:{url:av}}});
    });
}

let cflake = function(ctx,msg,args){
    if(!isNaN(parseInt(args))){
        let snowflake = parseInt(args).toString(2);
        snowflake = "0".repeat(64-snowflake.length) + snowflake;
        let date = snowflake.substr(0,42);
        let timestamp = parseInt(date,2)+1420070400000;

        msg.channel.createMessage(`The timestamp for \`${args}\` is ${new Date(timestamp)}`);
    }else{
        msg.channel.createMessage("Arguments not a number.");
    }
}

let linvite = async function(ctx,msg,args){
    let data = await ctx.libs.superagent.get(`https://discordapp.com/api/v7/invites/${args}?with_counts=1`).set("User-Agent","HiddenPhox (v9, Eris)").set("Content-Type","application/json").set("Authorization",ctx.bot.token);
    let req = await ctx.libs.superagent.get("https://endpwn.cathoderay.tube/goodies.json");
    let goodies = req ? req.body : {};
    let inv = data.body;

    if(inv.message && inv.message == "Unknown Invite"){
        msg.channel.createMessage("Invite provided is not valid.");
    }else if(inv.guild && inv.channel){
        let edata = {
            title:`Invite Info: \`${inv.code}\``,
            fields:[
                {name:"Guild",value:`**${inv.guild.name}** (${inv.guild.id})`,inline:true},
                {name:"Channel",value:`**#${inv.channel.name}** (${inv.channel.id})`,inline:true},
                {name:"Member Count",value:`<:online:313956277808005120>${inv.approximate_presence_count} online\t\t<:offline:313956277237710868> ${inv.approximate_member_count} members`,inline:false},
                {name:"Flags",value:`<:partner:314068430556758017>: ${(inv.guild.features.includes("VANITY_URL") || inv.guild.features.includes("INVITE_SPLASH") || inv.guild.features.includes("VIP_REGIONS")) ? "<:GreenTick:349381062176145408>" : "<:RedTick:349381062054510604>"}\t\t<:verified:439149164560121865>: ${inv.guild.features.includes("VERIFIED") ? "<:GreenTick:349381062176145408>" : "<:RedTick:349381062054510604>"}${goodies.guilds.includes(inv.guild.id) ? "\t\t<:endpwn:442459680422363136>: <:GreenTick:349381062176145408>" : ""}`,inline:false}
            ],
            thumbnail:{url:`https://cdn.discordapp.com/icons/${inv.guild.id}/${inv.guild.icon}.png`}
        }

        if(inv.inviter){
            edata.fields.push({name:"Inviter",value:`**${inv.inviter.username}#${inv.inviter.discriminator}** (${inv.inviter.id})`,inline:true});
        }

        edata.fields.push({name:"\u200b",value:`[Icon](https://cdn.discordapp.com/icons/${inv.guild.id}/${inv.guild.icon}.png?size=1024)${inv.guild.splash !== null ? " | [Splash](https://cdn.discordapp.com/splashes/${inv.guild.id}/${inv.guild.splash}.png?size=2048)" : ""}`,inline:false});

        if(inv.guild.splash !== null){
            edata.image = {url:`https://cdn.discordapp.com/splashes/${inv.guild.id}/${inv.guild.splash}.png?size=256`}
        }

        msg.channel.createMessage({embed:edata});
    }
}

let mods = function(ctx,msg,args){
    if(msg.channel.guild){
        if(!args){
            let res = "Moderators for **"+msg.channel.guild.name+"**:"

            let a = {
                online:"",
                idle:"",
                dnd:"",
                offline:""
            }

            msg.channel.guild.members.forEach((u)=>{
                if((msg.channel.permissionsOf(u.id).has("kickMembers") || msg.channel.permissionsOf(u.id).has("manageMessages")) && !u.bot){
                    a[u.status]+="\n"+statusIcons[u.status]+ u.username+"#"+u.discriminator+(u.nick ? " ("+u.nick+")" : "")
                }
            })

            for(s in a){
                res+=a[s]
            }
            msg.channel.createMessage(res)
        }else if(args == "online" || args == "o"){
            let res = "Online moderators for **"+msg.channel.guild.name+"**:"

            msg.channel.guild.members.forEach((u)=>{
                if((msg.channel.permissionsOf(u.id).has("kickMembers") || msg.channel.permissionsOf(u.id).has("manageMessages")) && !u.bot && u.status != "offline"){
                    res+="\n"+statusIcons[u.status]+ u.username+"#"+u.discriminator
                }
            })
            msg.channel.createMessage(res)
        }
    }else{
        msg.channel.createMessage("Command cannot be used outside of servers.")
    }
}

let binfo = async function(ctx,msg,args){
    let u = await ctx.utils.lookupUser(ctx,msg,args || msg.author.mention).catch(m=>{
        if(m == "No results." || m == "Canceled"){
            msg.channel.createMessage(m);
        }
    });

    if(u.bot){
        let req = await ctx.libs.superagent.get(`https://bots.discord.pw/api/bots/${u.id}`).set("Authorization",ctx.apikeys.dbots);
        let data = req.body;

        if(data.error){
            if(data.error == "Bot user ID not found" || data.error == "Not Found."){
                msg.channel.createMessage("No bot info found, may not be on botlist.")
            }else{
                msg.channel.createMessage("An error occured.")
            }
            return;
        }

        let owners = [];
        for(let b in data["owner_ids"]){
            owners.push(`<@${data["owner_ids"][b]}>`);
        };

        let edata = {
            color:0x7289DA,

            title:`Bot Info: \`${u.username}#${u.discriminator}\``,
            description:data.description,
            fields:[
                {name:"ID",value:u.id,inline:true},
                {name:"Owner(s)",value:owners.join("\n"),inline:true},
                {name:"Library",value:data.library,inline:true},
                {name:"Prefix",value:"`"+data.prefix+"`",inline:true},
            ],
            footer:{
                text:"Info provided by bots.discord.pw",
            },
            thumbnail:{
                url:"https://cdn.discordapp.com/avatars/"+u.id+"/"+u.avatar
            }
        };

        if(data.invite_url !== null){
            edata.fields.push({name:"Invite",value:"[Click For Invite]("+data.invite_url+")",inline:true});
        }

        msg.channel.createMessage({embed:edata});
    }else{
        let req = await ctx.libs.superagent.get(`https://bots.discord.pw/api/users/${u.id}`).set("Authorization",ctx.apikeys.dbots);
        let data = req.body;

        if(data.error){
            if(data.error == "User ID not found" || data.error == "Not Found."){
                msg.channel.createMessage(`No bots found for **${u.username}#${u.discriminator}**`);
            }else{
                msg.channel.createMessage("An error occured.");
            }
            return;
        }

        let bots = [];
        for(let b in data.bots){
            bots.push(`<@${data.bots[b].user_id}>`)
        }

        let edata = {
            color:0x7289DA,

            title:`Bots for user: \`${u.username}#${u.discriminator}\``,
            description:`**${u.username}#${u.discriminator}** owns **${bots.length} bot(s)**:\n\n`+bots.join("\n"),
            thumbnail:{
                url:"https://cdn.discordapp.com/avatars/"+u.id+"/"+u.avatar
            }
        }

        msg.channel.createMessage({embed:edata});
    }
}

let ptypes = [
	"Playing",
	"Streaming",
	"Listening to",
	"Watching"
];

let uinfo = function(ctx,msg,args){
    ctx.utils.lookupUser(ctx,msg,args || msg.member.mention)
    .then(async u=>{
        let req = await ctx.libs.superagent.get("https://endpwn.cathoderay.tube/goodies.json").catch(x=>{});
        let goodies = req ? req.body : {};
        if(msg.channel.guild && msg.channel.guild.members.get(u.id)){
            u = msg.channel.guild.members.get(u.id);
            let e = {
                color:ctx.utils.topColor(ctx,msg,u.id),
                title:`User Info: \`${u.username}#${u.discriminator}\``,
                fields:[
                        {name:"ID",value:u.id,inline:true},
                        {name:"Nickname",value:u.nick ? u.nick : "None",inline:true},
                        {name:"Status",value:u.game ? (u.game.url ? "<:streaming:313956277132853248> [Streaming]("+u.game.url+")" : statusIcons[u.status]+" "+u.status ) : statusIcons[u.status]+" "+u.status,inline:true},
                        {name:ptypes[u.game && u.game.type || 0],value:u.game ? u.game.name : "Nothing",inline:true},
                        {name:"Roles",value:u.guild ? (u.roles.length > 0 ? u.roles.map(r=>`<@&${r}>`).join(", ") : "No roles") : "No roles",inline:true},
                        {name:"Shared Servers",value:`${ctx.bot.guilds.filter(a=>a.members.get(u.id)).length} servers`,inline:true},
                        {name:"Created At",value:new Date(u.createdAt).toUTCString(),inline:true},
                        {name:"Joined At",value:new Date(u.joinedAt).toUTCString(),inline:true}
                    ],
                thumbnail:{
                    url:`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${(u.avatar.startsWith("a_") ? "gif" : "png?size=256")}`
                }
            }

            if ((goodies.users && goodies.users[u.id]) || (goodies.bots && goodies.bots.includes(u.id))){
                e.fields.push({name:"EndPwn Goodies",value:`**Discrim:** ${goodies.users[u.id] || "not set"}\t\t**Bot Tag:** ${goodies.bots.includes(u.id) ? "<:GreenTick:349381062176145408>" : "<:RedTick:349381062054510604>"}${goodies.devs.includes(u.id) ? "\t\t**Dev:** <:GreenTick:349381062176145408>" : ""}`})
            }

            e.fields.push({name:"Avatar",value:"[Full Size]("+`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${(u.avatar.startsWith("a_") ? "gif" : "png")}?size=1024`+")",inline:true});

            msg.channel.createMessage({embed:e})
        }else{
            let snowflake = parseInt(u.id).toString(2);
            snowflake = "0".repeat(64-snowflake.length) + snowflake;
            let date = snowflake.substr(0,42);
            let timestamp = parseInt(date,2)+1420070400000;

            let e = {
                color:0x7289DA,

                title:`User Info: \`${u.username}#${u.discriminator}\``,
                fields:[
                        {name:"ID",value:u.id,inline:true},
                        {name:"Shared Servers",value:`${ctx.bot.guilds.filter(a=>a.members.get(u.id)).length} servers`,inline:true},
                        {name:"Created At",value:new Date(timestamp).toUTCString(),inline:true}
                    ],
                thumbnail:{
                    url:`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${(u.avatar.startsWith("a_") ? "gif" : "png?size=256")}`
                }
            }

            if ((goodies.users && goodies.users[u.id]) || (goodies.bots && goodies.bots.includes(u.id))){
                e.fields.push({name:"EndPwn Goodies",value:`**Discrim:** ${goodies.users[u.id] || "not set"}\t\t**Bot Tag:** ${goodies.bots.includes(u.id) ? "<:GreenTick:349381062176145408>" : "<:RedTick:349381062054510604>"}${goodies.devs.includes(u.id) ? "\t\t**Dev:** <:GreenTick:349381062176145408>" : ""}`})
            }

            e.fields.push({name:"Avatar",value:"[Full Size]("+`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${(u.avatar.startsWith("a_") ? "gif" : "png")}?size=1024`+")",inline:true});

            msg.channel.createMessage({embed:e});
        }
    }).catch(m=>{
        if(m == "No results." || m == "Canceled"){
            msg.channel.createMessage(m);
        }else{
            ctx.utils.logWarn(ctx,"Exception in command: "+m);
        }
    });
}

let sinfo = async function(ctx,msg,args){
    let flags = {
        "eu-central":":flag_eu:",
        "london":":flag_gb:",
        "amsterdam":":flag_nl:",
        "japan":":flag_jp:",
        "brazil":"<:lunahahayes:383962711274291200>",
        "us-west":":hamburger:",
        "hongkong":":flag_hk:",
        "sydney":":flag_au:",
        "singapore":":flag_sg:",
        "us-central":":hamburger:",
        "eu-west":":flag_eu:",
        "us-south":":hamburger:",
        "us-east":":hamburger:",
        "frankfurt":":flag_de:",
        "russia":":flag_ru:"
    }

    let req = await ctx.libs.superagent.get("https://endpwn.cathoderay.tube/goodies.json").catch(x=>{});
    let goodies = req ? req.body : {};

    if(msg.channel.guild){
        let g = msg.channel.guild;

        let bots = g.members.filter(u=>u.bot).length;

        let emojis = [];
        g.emojis.forEach(e=>{
            emojis.push(`<${e.animated ? "a" : ""}:${e.name}:${e.id}>`);
        });

        emojis = emojis.sort(function(a, b) {
            a = a.toLowerCase().replace(/<(a)?:(.+):(.+)>/,"$2");
            b = b.toLowerCase().replace(/<(a)?:(.+):(.+)>/,"$2");
            return (a < b) ? 1 : (a > b) ? -1 : 0;
        });

        let tmp = [];
        emojis.forEach(e=>{
            tmp.push(e.replace(/:(.+):/,":_:"));
        });
        emojis = tmp;
        tmp = undefined;

        let info = {
            color:0x7289DA,
            title:`Server Info for \`${g.name}\``,
            fields:[
                {name:"ID",value:g.id,inline:true},
                {name:"Owner",value:`<@${g.ownerID}>`,inline:true},
                {name:"Total Members",value:g.memberCount,inline:true},
                {name:"Humans",value:`${g.memberCount-bots} (${Math.round(((g.memberCount-bots)/g.memberCount)*100)}% of members)`,inline:true},
                {name:"Bots",value:`${bots} (${Math.round((bots/g.memberCount)*100)}% of members)`,inline:true},
                {name:"Channels",value:g.channels.size,inline:true},
                {name:"Region",value:(flags[g.region] || ":flag_black:")+" "+(g.region || "Unknown Region???"),inline:true},
                {name:"Shard",value:g.shard.id,inline:true},
                {name:"Roles",value:g.roles.size,inline:true},
                {name:"Emoji Count",value:g.emojis.length,inline:true},
                {name:"Created At",value:new Date(g.createdAt).toUTCString(),inline:true},
                {name:"Icon",value:"[Full Size](https://cdn.discordapp.com/icons/"+g.id+"/"+g.icon+".png?size=1024)",inline:true},
            ],
            thumbnail:{
                url:"https://cdn.discordapp.com/icons/"+g.id+"/"+g.icon+".png?size=256"
            }
        };

        info.fields.push({name:"Flags",value:`<:partner:314068430556758017>: ${(g.features && (g.features.includes("VANITY_URL") || g.features.includes("INVITE_SPLASH") || g.features.includes("VIP_REGIONS"))) ? "<:GreenTick:349381062176145408>" : "<:RedTick:349381062054510604>"}\t\t<:verified:439149164560121865>: ${g.features && g.features.includes("VERIFIED") ? "<:GreenTick:349381062176145408>" : "<:RedTick:349381062054510604>"}${goodies.guilds.includes(g.id) ? "\t\t<:endpwn:442459680422363136>: <:GreenTick:349381062176145408>" : ""}`,inline:true});


        if(emojis.length > 0){
            info.fields.push({name:"Emojis (1-25)",value:emojis.slice(0,25).join(" "),inline:true});
        }

        if(emojis.length > 25){
            info.fields.push({name:"Emojis (26-50)",value:emojis.slice(25,50).join(" "),inline:true});
        }

        if(emojis.length > 50){
            info.fields.push({name:"Emojis (51-75)",value:emojis.slice(50,75).join(" "),inline:true});
        }

        if(emojis.length > 75){
            info.fields.push({name:"Emojis (76-100)",value:emojis.slice(75,100).join(" "),inline:true});
        }

        if(emojis.length > 100){
            info.fields.push({name:"Emojis (101-150)",value:emojis.slice(100,150).join(" "),inline:true});
        }

        if(emojis.length > 150){
            info.fields.push({name:"Emojis (151-200+)",value:emojis.slice(150).join(" "),inline:true});
        }

        msg.channel.createMessage({embed:info});
    }else{
        msg.channel.createMessage("This command can only be used in servers.");
    }
}

let rinfo = function(ctx,msg,args){
    ctx.utils.lookupRole(ctx,msg,args || "")
    .then(r=>{
        let users = 0;
        let bots = 0;
        msg.channel.guild.members.forEach(m=>{
            if(m.roles.indexOf(r.id) > -1){
                if(m.bot) bots++;
                users++;
            }
        });

        let perms = [];
        Object.keys(r.permissions.json).forEach(k=>{
            perms.push(`${r.permissions.json[k] == true ? "\u2705" : "\u274C"} ${k}`);
        });

        if(perms.length == 0){
            perms.push("None");
        }
        msg.channel.createMessage({embed:{
            color:r.color,

            title:`Role Info: \`${r.name}\``,
            fields:[
                {name:"ID",value:r.id,inline:true},
                {name:"Color",value:r.color ? "#"+(r.color.toString(16).length < 6 ? "0".repeat(6-r.color.toString(16).length) : "")+r.color.toString(16).toUpperCase() : "None",inline:true},
                {name:"Users in role",value:users,inline:true},
                {name:"Bots in role",value:bots,inline:true},
                {name:"Mentionable",value:r.mentionable ? r.mentionable : "false",inline:true},
                {name:"Managed",value:r.managed ? r.managed : "false",inline:true},
                {name:"Position",value:r.position,inline:true},
                {name:"Permissions",value:perms.join(", ")}
            ],
        }});
    }).catch(m=>{
        if(m == "No results." || m == "Canceled"){
            msg.channel.createMessage(m);
        }
    });
}

let setav = async function(ctx,msg,args){
    if(msg.author.id === "150745989836308480"){
        let url;
        if(args && args.indexOf("http")>-1){
    		url = args;
    	}else if(msg.attachments.length>0){
    		url = msg.attachments[0].url;
    	}else{
    		msg.channel.createMessage("Image not found. Please give URL or attachment.");
    		return;
    	}

    	let req = await ctx.libs.request.get(url);

		let data = `data:${res.headers["content-type"]};base64${new Buffer(req.text).toString("base64")}`;
		ctx.bot.editSelf({avatar:data})
		.then(()=>{
			msg.channel.createMessage(emoji.get(":white_check_mark:")+" Avatar set.");
		});
    }else{
        msg.channel.createMessage("No permission.");
    }
}

let slist = function(ctx,msg,args){
    let servers = [];

	ctx.bot.guilds.forEach(s=>{
		servers.push(s);
    });

	servers.sort((a,b)=>{
		if(a.memberCount>b.memberCount) return -1;
		if(a.memberCount<b.memberCount) return 1;
		if(a.memberCount==b.memberCount) return 0;
	});

	let index = 1;
    if(args) index=parseInt(args);

	let list = [];
    let page = servers.slice((index-1)*10,(index*10));

	page.map((s,i)=>{
        let bots = s.members.filter(u=>u.bot).length;
		list.push({name:((i+1)+((index-1)*10))+". "+s.name,value:`${s.memberCount} members, ${bots} bots (${Math.floor((bots/s.memberCount)*100)}%)\n${s.channels.size} channels, ${s.roles.size} roles`,inline:true});
    });

    msg.channel.createMessage({embed:{
        title:"Server List",
        fields:list,
        footer:{
            text:`Page ${index} of ${Math.floor(ctx.bot.guilds.size/10)} | ${ctx.bot.guilds.size} total servers`
        }
    }});
}

let presence = function(ctx,msg,args){
    if(!msg.channel.guild){
        msg.channel.createMessage("Can only be used in guilds due to API limitations.");
        return;
    }

    ctx.utils.lookupUser(ctx,msg,args || msg.member.mention)
    .then(u=>{
        u = msg.channel.guild.members.get(u.id);

        if(u.game){
            let embed = {
                title:`Presence for \`${u.username}#${u.discriminator}\``,
                fields:[
                    {name:"Status",value:u.game ? (u.game.url ? "<:streaming:313956277132853248> [Streaming]("+u.game.url+")" : statusIcons[u.status]+" "+u.status ) : statusIcons[u.status]+" "+u.status,inline:true},
                    {name:ptypes[u.game && u.game.type || 0],value:u.game ? u.game.name : "Nothing",inline:true},
                ],
                color:u.game.name == "Spotify" ? 0x1db954 : ctx.utils.topColor(ctx,msg,u.id)
            };

            if(u.game.application_id || u.game.flags == 48){
                embed.fields.push({name:"Details",value:u.game.details ? u.game.details : "None provided.",inline:true});
                embed.fields.push({name:"State",value:u.game.state ? u.game.state : "None provided.",inline:true});
                embed.fields.push({name:"Party Size",value:(u.game.party && u.game.party.size) ? `${u.game.party.size[0]} of ${u.game.party.size[1]}` : "None provided.",inline:true});
                embed.fields.push({name:"Large Icon Text",value:(u.game.assets && u.game.assets.large_text) ? u.game.assets.large_text : "None provided.",inline:true});
                embed.fields.push({name:"Small Icon Text",value:(u.game.assets && u.game.assets.small_text) ? u.game.assets.small_text : "None provided.",inline:true});

                embed.thumbnail = {url:(u.game.assets && u.game.assets.large_image) ? "attachment://rpcicon.png" : "https://cdn.discordapp.com/emojis/402275812637933598.png"};
            }

            embed.fields.push({name:"Time Elapsed",value:(u.game.timestamps && u.game.timestamps.start) ? ctx.utils.remainingTime(new Date().getTime()-u.game.timestamps.start)+" elapsed" : "None provided.",inline:true});
            embed.fields.push({name:"End Time",value:(u.game.timestamps && u.game.timestamps.end) ? ctx.utils.remainingTime(u.game.timestamps.end-u.game.timestamps.start)+" remaining" : "None provided.",inline:true});

            if(u.game.assets && u.game.assets.large_image){
                let jimp = require("jimp");

                jimp.read(u.game.assets.large_image.startsWith("spotify:") ? u.game.assets.large_image.replace("spotify:","http://i.scdn.co/image/") : `https://cdn.discordapp.com/app-assets/${u.game.application_id}/${u.game.assets.large_image}.png?size=128;`)
                .then(async i=>{
                    let a = i.clone().resize(96,jimp.AUTO);
                    let b = (u.game.assets && u.game.assets.small_image) ? `https://cdn.discordapp.com/app-assets/${u.game.application_id}/${u.game.assets.small_image}.png?size=128;` : "";

                    if(b.length > 0){
                        b = await jimp.read(b);
                        b = b.resize(32,jimp.AUTO);
                        a.composite(b,96-32,96-32);
                    }

                    a.getBuffer(jimp.MIME_PNG,(e,f)=>{
                        msg.channel.createMessage({embed:embed},{name:"rpcicon.png",file:f});
                    });
                });
            }else{
                msg.channel.createMessage({embed:embed});
            }
        }else{
            msg.channel.createMessage(`**${u.username}#${u.discriminator}** is not playing a game.\n**Status:** ${statusIcons[u.status]+" "+u.status}`)
        }
    });
}

let jumbo = function(ctx,msg,args){
    if(/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/.test(args)){
        let a = args.match(/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/);
        let animated = a[1] ? true : false;
        let name = a[2];
        let id = a[3];

        msg.channel.createMessage({embed:{
            title:`:${name}: - \`${id}\``,
            image:{
                url:`https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?v=1`
            }
        }});
    }else{
        msg.channel.createMessage("Emote not found. This currently only works for custom ones.");
    }
}

let einfo = function(ctx,msg,args){
    if(/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/.test(args)){
        let a = args.match(/<(a)?:([a-zA-Z0-9_*/-:]*):([0-9]*)>/);
        let animated = a[1] ? true : false;
        let name = a[2];
        let id = a[3];
        let guild;
        let emote;

        if(ctx.emotes.get(id)){
            emote = ctx.emotes.get(id);
            guild = ctx.bot.guilds.get(emote.guild_id)
        }

        msg.channel.createMessage({embed:{
            title:`Emoji Info: :${name}:`,
            fields:[
                {name:"ID",value:id,inline:true},
                {name:"Full Code",value:a[0].replace("<","\\<").replace(">","\\>"),inline:true},
                {name:"Animated?",value:animated,inline:true},
                {name:"Guild",value:guild ? `${guild.name} \`(${guild.id})\`` : "Not found",inline:true}
            ],
            thumbnail:{
                url:`https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?v=1`
            }
        }});
    }else{
        msg.channel.createMessage("Emote not found. This currently only works for custom ones.");
    }
}

module.exports = [
    {
        name:"eval",
        desc:"JS Eval",
        func:_eval,
        usage:"<string>",
        group:"utils"
    },
    {
        name:"restart",
        desc:"Restarts bot",
        func:restart,
        group:"utils"
    },
    {
        name: "reload",
        desc: "Reloads a command",
        func: reload,
        usage: "<command>",
        group: "utils"
    },
    {
        name: "ereload",
        desc: "Reloads a set of events",
        func: ereload,
        usage: "<event>",
        group: "utils"
    },
    {
        name: "exec",
        desc: "Bash.",
        func: exec,
        usage: "<command>",
        group: "utils"
    },
    {
        name: "setavatar",
        desc: "Sets bot's avatar.",
        func: setav,
        usage: "<url/attachment>",
        group: "utils"
    },

    {
        name: "avatar",
        desc: "Get the avatar of a user.",
        func: avatar,
        usage: "[user]",
        group: "utils"
    },
    {
        name:"lookupinvite",
        desc:"Lookup an invite",
        func:linvite,
        usage: "<invite>",
        group:"utils",
        aliases:["linvite"]
    },
    {
        name:"mods",
        desc:"Displays list of online mods",
        func:mods,
        group:"utils"
    },
    {
        name:"binfo",
        desc:"Displays info on a bot or lists a users bots if any.",
        func:binfo,
        usage: "[user]",
        group:"utils"
    },
    {
        name:"uinfo",
        desc:"Get info on a user.",
        func:uinfo,
        group:"utils"
    },
    {
        name:"sinfo",
        desc:"Displays info of a server",
        func:sinfo,
        group:"utils"
    },
    {
        name:"rinfo",
        desc:"Displays info of a role",
        func:rinfo,
        group:"utils"
    },
    {
        name:"convertflake",
        desc:"Converts a Discord snowflake to a readable time.",
        func:cflake,
        group:"utils",
        aliases:["cflake","snowflake"]
    },
    {
        name:"slist",
        desc:"Server list of servers HiddenPhox is in.",
        func:slist,
        group:"utils"
    },
    {
        name:"presence",
        desc:"Get presence/playing game of someone.",
        func:presence,
        group:"utils",
        aliases:["status"]
    },
    {
        name:"jumbo",
        desc:"Get the raw image of an emoji.",
        func:jumbo,
        group:"utils"
    },
    {
        name:"einfo",
        desc:"Get info of an emoji.",
        func:einfo,
        group:"utils",
        aliases:["e","emote","emoji"]
    },
]