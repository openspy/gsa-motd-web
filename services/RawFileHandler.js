
module.exports = function(pool, req, res, next) {
    var query = "SELECT `f`.`name` name, `f`.`data` FROM `services` `s` LEFT JOIN `files` `f` on `f`.`serviceid` = `s`.`id` where `s`.`name` = ? and `fsvid` = ? and `f`.`name` = ?;;"
    pool.query(query, [req.params.servicename, req.params.fsvid, req.params.filename], function(err, result) {
        if(result == null || result.length == 0 || result[0] == null) {
            res.status(404);
        } else {
            res.set('Content-Disposition', 'attachment; filename=' + result[0].name);
            res.set('Content-Type', 'application/application/octet-stream');
            res.write(result[0].data);
        }
        
        res.end();        
    });
}
