var Services = require("./Service");
var moment = require('moment');
var DEFAULT_PRODUCT_ID = 60;
module.exports = function(pool, req, res, next) {
    switch(req.query.mode) {
        case 'files':
            handle_files(pool, req, res, next).then(function() {
                res.end();
            });
            break;
        case 'detect':
            handle_detect(pool, req, res, next).then(function() {
                res.end();
            });
            break;
        case 'full':
            handle_full(pool, req, res, next).then(function() {
                res.end();
            });
            break;
        case 'modified':
            handle_modified(pool, req, res, next).then(function() {
                res.end();
            });
            break;
        default:
            res.end();
            break;
    }


}

async function handle_files(dbCtx, req, res, next) {
    var services = req.query.services.split('\\');
    var modified = parseInt(req.query.since);
    for(var i=0;i<services.length;i++) {
        var service = await Services.LoadService(dbCtx, services[i]);
        if(service == null) continue;
        var svc_modified = moment(service.modified).unix();
        if(svc_modified < modified) {
            continue;
        }
        res.write("[" + service.name + "]\n");
        
        res.write("fmt=" + svc_modified + "\n");
        res.write("fsvid=" + service.fsvid + "\n");
        for(var x=0;x<service.files.length;x++) {
            var file = service.files[x];
            res.write(file.name);
            res.write("=");
            res.write(file.num1.toString());
            res.write("\\");
            res.write(file.num2.toString());
            res.write("\\");
            res.write(file.hash);
            res.write("\n");
        }
    }
    
}

async function handle_full(dbCtx, req, res, next) {
    var services = null
    if(req.query.services) {
        services = [];
        var requested_services = req.query.services.split('\\');
        for(var i=0;i<requested_services.length;i++) {
            services.push(await Services.LoadService(dbCtx, requested_services[i]));
        }
    } else {
        services = await Services.LoadAllServices(dbCtx);
    }
    
    if(services == null) return;
    var keys = Object.keys(services);
    var modified = parseInt(req.query.since);
    for(var i=0;i<keys.length;i++) {
        var service = services[keys[i]];
        var svc_modified = moment(service.modified).unix();
        if(svc_modified < modified) {
            continue;
        }
        res.write("[" + service.name + "]\n");
        res.write("fpmt=" + svc_modified + "\n");
        res.write(service.keys);
    }
}

async function handle_modified(dbCtx, req, res, next) {
    var services = await Services.LoadModified(dbCtx, req.query.productid || DEFAULT_PRODUCT_ID, parseInt(req.query.since) || 0);
    if(services == null) return;
    var keys = Object.keys(services);
    var modified = parseInt(req.query.since);
    for(var i=0;i<keys.length;i++) {
        var service = services[keys[i]];
        if(service.detection_modified > modified || service.services_modified > modified || service.files_modified > modified) {
            res.write(service.service_name + " - ");
            res.write(service.detection_modified + " ");
            res.write(service.services_modified + " ");
            res.write(service.files_modified + "\n");
        }
    }
}


async function handle_detect(dbCtx, req, res, next) {
    var services = await Services.LoadDetection(dbCtx, req.query.productid || DEFAULT_PRODUCT_ID, req.query.since || 0);
    if(services == null) return;
    var modified = parseInt(req.query.since);
    for(var i=0;i<services.length;i++) {
        var service = services[i];
        if(service.detection_modified > modified) {
            res.write("[" + service.service_name + "]\n");
            res.write("dmt=" + service.detection_modified + "\n");
            res.write(service.keys);
        }
    }
}
