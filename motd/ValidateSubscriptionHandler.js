function shouldInc(cookie) {
    var multiplier = 43;
    var x = Math.floor(cookie/multiplier)-1;
    for(var i=0;i<1000;i++) {
        var lastinc = Math.floor((61+(multiplier*x)-(x/3)));;
        if((cookie-lastinc >= 0 && cookie-lastinc <= 21)) {
                        return 1;
                } else if(cookie-lastinc < 0) {
                        break;
                }
                x++;
    }return 0;

}
function getCookie(cookie) {
    var retval = (cookie*10)-239;
    retval -= (16*(Math.floor(cookie/4)));
    if(shouldInc(cookie)) {
        retval += 256;
    }
    return retval;
}
module.exports = function(pool, req, res, next) {
    //this endpoint doesn't seem to do anything, just used for tracking
    var cookie = getCookie(req.query.cookie);
    var result = "\\isreg\\1\\cookie\\" + cookie + "\\";
    res.write(result);
    res.end();
}
