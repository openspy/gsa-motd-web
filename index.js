/*

urls to patch in GSA for openspy (Aphex.exe, ArcRes.dll):
	webservices.gamespyid.com -> gsidsvs.gsarc.openspy.net
	www.gamespyid.com -> gsarc.openspy.net
	gamespy.com -> openspy.net
	gamespyarcade.com -> gsarc.openspy.net
*/

const express = require('express')
const app = express()


var mysql = require('mysql');
var path = require('path');

var morgan = require('morgan')
app.use(morgan('combined'))
app.use(express.urlencoded({ extended: true }));


var pool  = mysql.createPool({
    host     : process.env.MYSQL_HOST || 'localhost',
    port     : process.env.MYSQL_PORT,
    user     : process.env.MYSQL_USER || 'root',
    password : process.env.MYSQL_PASSWORD || 'password',
    database : process.env.MYSQL_DB || 'MOTDWeb'
});

var SoftwareServicesHandler = require('./services/SoftwareServicesHandler');
var MOTDHandler = require('./motd/MOTDHandler');
var VersionCheckHandler = require('./motd/VersionCheckHandler');
var ValidateSubscriptionHandler = require('./motd/ValidateSubscriptionHandler');
var ImglibHandler = require('./services/ImglibHandler');
var ChatClubsHandler = require('./services/ChatClubHandler');
var FeaturesHandler = require('./services/Features');

app.get('/', function(req, res, next) {
    res.end();
});

global.software_static_path = path.join(__dirname, 'public');


app.use('/software/', express.static(global.software_static_path))
app.get('/software/services/index.aspx', SoftwareServicesHandler.bind(null, pool));
app.get('/software/welcome.asp', function(req, res, next) {
	res.send("Welcome to OpenSpy!");
	res.end();
});
app.get("/software/eula/", function(req, res, next) {
	res.send("GSA EULA");
	res.end();
});
app.get("/aunit1.asp", function(req, res, next) {
	res.send("BOTTOM AD");
	res.end();
});
app.get("/software/banner.html", function(req,res, next) {
	res.send("BANNER");
	res.end();
});
//app.get('/software/services/:servicename/:fsvid/:filename', RawFileHandler.bind(null, pool));

app.get('/motd/motd.asp', MOTDHandler.bind(null, pool));
app.get('/motd/vercheck.asp', VersionCheckHandler.bind(null, pool));
app.get('/motd/validate.asp', ValidateSubscriptionHandler.bind(null, pool));

//maybe not needed
app.get('/motd/motd.aspx', MOTDHandler.bind(null, pool));
app.get('/motd/vercheck.aspx', VersionCheckHandler.bind(null, pool));
app.post('/bundle.asp', function(req, res, next) {
	res.end();
});


//imglib
app.post('/software/imglib/ppost.asp', ImglibHandler.PicturePost.bind(null, pool, false));
app.get('/software/imglib/portraits/user/*', ImglibHandler.PortraitGet.bind(null, pool, false));
app.post('/software/imglib/ippost.asp', ImglibHandler.PicturePost.bind(null, pool, true));
app.get('/software/imglib/icons/user/*', ImglibHandler.PortraitGet.bind(null, pool, true));
app.post('/software/imglib/userfilepost.asp', ImglibHandler.UserFileStore.bind(null, pool));
app.get('/software/imglib/userfiles/*', ImglibHandler.UserFileGet.bind(null, pool));

//chatclubs
app.get('/software/chatclubs/club.aspx', ChatClubsHandler.GetClub.bind(null, pool));

//subscriber feature
app.get('/users/features.asmx/GetFeatures', FeaturesHandler.GetFeatures.bind(null, pool));

app.use(function (err, req, res, next) {
	console.log(err);
	res.status(500).end();
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on port: ', process.env.PORT || 3000))
