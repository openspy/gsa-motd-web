const busboy = require('../busboy/index');
const tmp = require('tmp');
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true, appPath: process.env.GM_APP_PATH });
const OpenSpy = require("../OpenSpy");

//this calculates "fake path" that GSA uses, because of PID overflow it actually can result in duplicates for certain PIDs
//but without arcade changes / fixes this is the best that can be done and should suffice
function CalculatePathFolders(profileid, picnum) {
    var path = "";
    path += Math.floor(profileid / 1000000) + "/";
    path += Math.floor((profileid % 1000000) / 1000) + "/";
    path += Math.floor(profileid % 1000) + "/";
    if(picnum != null) {
        path += "0" + Math.floor(picnum % 10 + 1000); //formatted as %05d in GSA, but due to modulus can never be more than 4 chars, just add the 0 to the front
    }
    
    return path;
}
function PicturePost(pool, isChatIcon, req, res, next) {
    var pid = parseInt(req.query.pid);
    var picnum = parseInt(req.query.picnum);
    OpenSpy.ValidatePassword(pid, req.query.ppass).then(function(result) {
        var fake_path = CalculatePathFolders(pid, picnum);
        if(!result) {
            res.send("GSIERR: Credentials invalid");
            res.end();
            return;
        }

        var requiresSize = {width: 96, height: 96};
        if(isChatIcon) {
            requiresSize.width = 20;
            requiresSize.height = 16;
        }
    
        const bb = busboy({ headers: req.headers });
        var fileName = tmp.tmpNameSync({prefix: 'portrait-', postfix: '.bin', keep: false});
        var writeStream = fs.createWriteStream(fileName);
        bb.on('file', (name, file, info) => {
            file.pipe(writeStream);
            file.on('close', function() {
                writeStream.end();
    
                var img = gm(fileName);
                img.identify(function(err, val) {
                    if(err) {
                        fs.unlinkSync(fileName);
                        res.send("GSIERR: error processing image").end();
                        return
                    }
                    if(requiresSize.width != val.size.width || requiresSize.height != val.size.height) {
                        fs.unlinkSync(fileName);
                        res.send("GSIERR: image size must be exactly " + requiresSize.width + "x" + requiresSize.height).end();
                        return
                    }
    
                    var buffer = fs.readFileSync(fileName);
    
                    fs.unlinkSync(fileName);
    
                    var delete_quey = "";
                    if(isChatIcon) {
                        delete_quey = "DELETE FROM `user_images` where `profileid` = ? AND `picnum` = ? AND `chaticon` = 1";
                    } else {
                        delete_quey = "DELETE FROM `user_images` where `profileid` = ? AND `picnum` = ? AND `chaticon` = 0";
                    }
                    
                    pool.query(delete_quey, [pid, picnum], function(deleteErr, deleteResult) {
                        if(deleteErr) {
                            res.send("GSIERR: Failed to delete existing image");
                            res.end();
                            return
                        }
                        var insert_query = "";
                        if(isChatIcon) {
                            insert_query = "INSERT INTO `user_images` (`profileid`,`picnum`,`data`,`chaticon`, `fake_path`) VALUES (?,?,?,1,?)";
                        } else {
                            insert_query = "INSERT INTO `user_images` (`profileid`,`picnum`,`data`,`chaticon`, `fake_path`) VALUES (?,?,?,0,?)";
                        }
                        pool.query(insert_query, [pid, picnum, buffer, fake_path], function(insertErr, insertResult) {
                            if(insertErr) {
                                res.send("GSIERR: Failed to save existing image");
                                res.end();
                                return
                            }
                            res.send("GSIOK");
                            res.end();
                        });
                    });   
                });
                
            })
        });
        req.pipe(bb);
    });

}

function PortraitGet(pool, isChatIcon, req, res, next) {
    var urlParams = req.params[0];
    var lastDot = urlParams.lastIndexOf(".");

    if (lastDot == -1) {
        res.status(404).end();
        return
    }

    var fakePath = urlParams.substr(0, lastDot);

    var query = "";
    if(isChatIcon) {
        query = "SELECT data FROM user_images WHERE fake_path = ? AND chaticon = 1";
    } else {
        query = "SELECT data FROM user_images WHERE fake_path = ? AND chaticon = 0";
    }
    
    pool.query(query, [fakePath], function(err, result) {
        if(err) {
            res.status(500).end();
            return;
        }
        if(result == null || result.length == 0) {
            res.status(404).end();
            return;
        }
        res.contentType('application/octet-stream');
        res.send(result[0].data);
        res.end();
    });
}

function UserFileStore(pool, req, res, next) {
    var pid = parseInt(req.query.pid);
    var fileName = req.query.fname;
    var fake_path = CalculatePathFolders(pid, null);
    fake_path += fileName;
    var delete_query = "DELETE FROM `user_files` WHERE `profileid` = ? and `filename` = ?";
    pool.query(delete_query, [pid, fileName], function(err, result) {
        var insert_query = "INSERT INTO `user_files` (`profileid`,`filename`,`data`, `fake_path`) VALUES (?,?,?,?)";
        if(err) {
            res.send("GSIERR: Error occured").end();
            return;
        }
        var fileBuffer = Buffer.from(req.body.data, "ascii");
        pool.query(insert_query, [pid, fileName, fileBuffer, fake_path], function(err, result) {
            if(err) {
                res.send("GSIERR: Error occured").end();
                return;
            }
            res.send("GSIOK");
            res.end();
        });
    });
}

function UserFileGet(pool, req, res, next) {
    var urlParams = req.params[0];

    var query = "SELECT data FROM user_files WHERE fake_path = ?";
    
    pool.query(query, [urlParams], function(err, result) {
        if(err) {
            res.status(500).end();
            return;
        }
        if(result == null || result.length == 0) {
            res.status(404).end();
            return;
        }
        res.contentType('application/octet-stream');
        res.send(result[0].data);
        res.end();
    });
}

module.exports = {PicturePost, PortraitGet, UserFileStore, UserFileGet};