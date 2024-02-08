var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
function GetFileHash(serviceName, fsvid, fileName) {
    var fullPath = path.join(global.software_static_path, "services/", serviceName + "/" + fsvid + "/" + fileName);

    var hashSum = crypto.createHash('md5');
    if(fs.existsSync(fullPath)) {        
        hashSum.update(fs.readFileSync(fullPath));
    }
    return hashSum.digest('hex').toString();
}
function LoadService(dbCtx, serviceName) {
    return new Promise(function(resolve, reject) {
        var query = "SELECT `s`.`name` svcName, `s`.`keys` svcKeys, `s`.`modified` svcModified, `f`.`name` fileName, `f`.`fsvid` fsvid, `f`.`num1` num1, `f`.`num2` num2, `f`.`modified` modified FROM `files` f RIGHT JOIN `services` s on `s`.`id` = `f`.`serviceid` where `s`.`name` = ?";
        dbCtx.query(query, [serviceName], function(err, result) {
            if (err) return reject(err);
            if(result == null || result.length == 0) return resolve(null);
            var service = {name: result[0].svcName, keys: result[0].svcKeys, modified: result[0].svcModified, files: []};
            for(var i=0;i<result.length;i++) {
                var file = {};
                
                file.name = result[i].fileName;
                file.fsvid = result[i].fsvid;
                service.fsvid = file.fsvid; //lame hack! get a real fsvid value for services! (likely version id)
                file.num1 = result[i].num1;
                file.num2 = result[i].num2;
                file.hash = GetFileHash(service.name, file.fsvid, file.name);
                file.modified = result[i].modified;
                service.files.push(file);
            }
            resolve(service);
        });        
    });
}
function LoadAllServices(dbCtx) {
    return new Promise(function(resolve, reject) {
        var query = "SELECT `s`.`name` svcName, `s`.`keys` svcKeys, `s`.`modified` svcModified, `f`.`name` fileName, `f`.`fsvid` fsvid, `f`.`num1` num1, `f`.`num2` num2, `f`.`modified` modified FROM `files` f RIGHT JOIN `services` s on `s`.`id` = `f`.`serviceid`";
        
        dbCtx.query(query, [], function(err, result) {
            var services = {};
            if (err) return reject(err);
            if(result == null || result.length == 0) return resolve(null);
            for(var i=0;i<result.length;i++) {
                if(services[result[i].svcName] === undefined) {
                    services[result[i].svcName] = {name: result[i].svcName, keys: result[i].svcKeys, modified: result[i].svcModified, files: []};
                }
                if(result[i].fileName != null) {
                    var file = {};                
                    file.name = result[i].fileName;
                    file.fsvid = result[i].fsvid;
                    services[result[i].svcName].fsvid = file.fsvid; //lame hack! get a real fsvid value for services! (likely version id)
                    file.num1 = result[i].num1;
                    file.num2 = result[i].num2;
                    file.hash = GetFileHash(services[result[i].svcName].name, file.fsvid, file.name);
                    file.modified = result[i].modified;
                    services[result[i].svcName].files.push(file);
                }
            }           
            resolve(services);
        });
        
    })
}
function LoadModified(dbCtx, product, since) {
    return new Promise(function(resolve, reject) {
        var query = "SELECT serviceid,MAX(service_name) service_name, MAX(services_modified) services_modified, MAX(detection_modified) detection_modified, MAX(files_modified) files_modified  FROM(SELECT s.id serviceid, s.name service_name,UNIX_TIMESTAMP(s.modified) services_modified, UNIX_TIMESTAMP(d.modified) detection_modified, UNIX_TIMESTAMP(f.modified) files_modified FROM services s LEFT JOIN files f on s.id = f.serviceid  LEFT JOIN detection d on d.serviceid = s.id  INNER JOIN visibleservices v on v.serviceid = s.id AND v.productid = ? WHERE s.active = 1 AND GREATEST(UNIX_TIMESTAMP(s.modified), UNIX_TIMESTAMP(d.modified), UNIX_TIMESTAMP(f.modified), ?) != ? ORDER BY f.modified DESC)  sq  GROUP BY sq.serviceid ";
        dbCtx.query(query, [product, since, since], function(err, result) {
            var response = [];
            if (err) return reject(err);
            if(result == null || result.length == 0) return resolve(null);
            for(var i=0;i<result.length;i++) {
                var item = {serviceid: result[i].serviceid, service_name: result[i].service_name, services_modified: result[i].services_modified, detection_modified: result[i].detection_modified, files_modified: result[i].files_modified}
                response.push(item);
            }                   
            resolve(response);
        });
    });
}


function LoadDetection(dbCtx, product, since) {
    return new Promise(function(resolve, reject) {
        var query = "SELECT s.`name` service_name ,d.`keys`,unix_timestamp(d.`modified`) detection_modified ,s.`id` serviceid FROM `services` s INNER JOIN `detection` d ON d.`serviceid` = s.`id`  INNER JOIN visibleservices v on v.serviceid = s.id and v.productid = ? WHERE s.`active` = 1 AND UNIX_TIMESTAMP(d.modified) > ? ORDER BY d.`modified` DESC";
        dbCtx.query(query, [product, since], function(err, result) {
            var response = [];
            if (err) return reject(err);
            if(result == null || result.length == 0) return resolve(null);
            for(var i=0;i<result.length;i++) {
                var item = {
                    service_name: result[i].service_name, keys: result[i].keys, detection_modified: result[i].detection_modified
                }
                response.push(item);
            }                   
            resolve(response);
        });
    });
}

module.exports = {LoadService, LoadAllServices, LoadModified, LoadDetection};

