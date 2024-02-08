
function GetFeatures(pool, req, res, next) {
    var str = "";
    res.contentType('application/xml');
    str += ("<ArrayOfUserSubscriptionFeature>");
    str += ("<UserSubscriptionFeature>");
    str += ("<FeatureID>");
    str += ("10013");
    str += ("</FeatureID>")
    str += ("</UserSubscriptionFeature>");
    str += ("<UserSubscriptionFeature>");
    str += ("<FeatureID>");
    str += ("10007");
    str += ("</FeatureID>")
    str += ("</UserSubscriptionFeature>");
    str += ("</ArrayOfUserSubscriptionFeature>");
    res.send(str);
    res.end();
}
module.exports = {GetFeatures};