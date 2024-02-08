module.exports = function(pool, req, res, next) {
    res.write("\\newver\\0");
    res.end();
}