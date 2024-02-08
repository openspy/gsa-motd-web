
const OpenSpy = require("../OpenSpy");

function makeid(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function CreateOrUpdateChatClub(isModify, req, res, next) {
    var profileid = parseInt(req.query.pid);
    var channel_name = "#gsp!cc_" + profileid + "_" + makeid(7);
    if(isModify) {
        channel_name = req.query.chan;
    }
    var title = req.query.title;
    var request = {
        "channelmask": channel_name,
        "comment": "User created chatclub",
        "modeflags": 67, //tnz
        "setByNick": "gsa-motd-web",
        "topic": title,
        "groupname": "chatclub"
    };
    if(req.query.privpw) {
        request["password"] = req.query.privpw;
    }
    OpenSpy.CreateChanProps(request).then(function(chanprops_result) {
        if(!chanprops_result) {
            res.send("ERR_FAILURE\\Internal error")
            res.end();
            return;
        }
        var usermode_request = {
            "channelmask": channel_name,
            "comment": "Chatclub owner",
            "profileid": profileid,
            "modeflags": 16, //owner / O
            "setByNick": "gsa-motd-web",
            "isGlobal": true
          };
          OpenSpy.CreateUsermode(usermode_request).then(function(usermode_result) {
            var result = "";
            if(isModify) {
                result = "OK_MODIFY\\" + channel_name + "\\" + title;
            } else {
                result = "OK_CREATE\\" + channel_name + "\\" + title;
            }
            
            if(req.query.privpw) {
                result += "\\" + req.query.privpw;
            }
            res.send(result);
            res.end();
          });
    });
}
function GetChatClubPassword(req, res, next) {
    OpenSpy.GetChanProps(req.query.chan).then(function(result) {
        var pw = "";
        if(result.password) {
            pw = result.password;
        }
        res.send("OK_GETPW\\" + pw);
        res.end();
    });

}

function DestroyChatClub(req, res, next) {
    OpenSpy.GetUsermodesByChannelmask(req.query.chan).then(function(result) {
        var promises = [];
        for(var i=0;i<result.length;i++) {
            if(result[i].channelmask == req.query.chan) {
                var p = DeleteUsermodeById.DeleteUsermodeById(result[i].id);
                promises.push(p);
            }
        }
        Promise.all(promises).then(function(values) {
            OpenSpy.DeleteChanpropsByChannel(req.query.chan).then(function(result) {
                if(!result) {
                    res.send("ERR_FAILURE\\Failed to delete chat club");
                    res.end()
                    return;
                }
                res.send("OK_DESTROY");
                res.end();
            });
        });

    });

}
function GetClub(pool, req, res, next) {
    var queryIndex = req.url.indexOf("?");
    if(queryIndex != -1) {
        var queryStr = req.url.substr(queryIndex+1);
        var querySplit = queryStr.split("&");
        var queryObj = {}
        for(var i =0;i<querySplit.length;i++) {
            var queryItem = querySplit[i].split('=');
            queryObj[queryItem[0]] = decodeURIComponent(queryItem[1]);
        }
        req.query = queryObj;
    }

    switch(req.query.cmd) {
        case "create":
            return CreateOrUpdateChatClub(false, req, res, next);
        case "modify":
            return CreateOrUpdateChatClub(true, req, res, next);
        case "getpw":
            return GetChatClubPassword(req, res, next);
        case "destroy":
            return DestroyChatClub(req, res, next);
    }
    res.send("ERR_CLUBLIMIT\\You have reached the maximum limit of 5 userrooms");
    res.end();
}
module.exports = {GetClub};