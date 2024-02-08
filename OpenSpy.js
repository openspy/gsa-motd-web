const axios = require('axios');

function ValidatePassword(profileid, password) {
    return new Promise(function(resolve, reject) {
        var request_body = {};
        request_body["profileLookup"] = {id: profileid};
        request_body["password"] = password;
    
        var axios_request = {
            'url': "/v1/Auth/Login",
            'baseURL': process.env.OPENSPY_API_URL,
            method: "POST",
            headers: {APIKey: process.env.OPENSPY_API_KEY},
            data: request_body
          };

          axios(axios_request).then(function(response) {
            var data = response.data;
            if(data.error != undefined || data.profile == undefined) {
                resolve(false);
            } else {
                resolve(true);
            }
        }.bind(this), reject);
    });
}
function CreateChanProps(request_body) {
    return new Promise(function(resolve, reject) {
        var axios_request = {
            'url': "/v1/Chanprops",
            'baseURL': process.env.OPENSPY_API_URL,
            method: "PUT",
            headers: {APIKey: process.env.OPENSPY_API_KEY},
            data: request_body
          };

          axios(axios_request).then(function(response) {
            var data = response.data;
            if(data.error != undefined) {
                resolve(false);
            } else {
                resolve(response);
            }
        }.bind(this), reject);
    });
}

function GetChanProps(channel_name) {
    var request_body = {
        "channelmask": channel_name
      }
    return new Promise(function(resolve, reject) {
        var axios_request = {
            'url': "/v1/Chanprops/lookup",
            'baseURL': process.env.OPENSPY_API_URL,
            method: "POST",
            headers: {APIKey: process.env.OPENSPY_API_KEY},
            data: request_body
          };

          axios(axios_request).then(function(response) {
            var data = response.data;
            if(data.error != undefined) {
                resolve(false);
            } else {
                resolve(response);
            }
        }.bind(this), reject);
    });
}

function CreateUsermode(request_body) {
    return new Promise(function(resolve, reject) {
        var axios_request = {
            'url': "/v1/Usermode",
            'baseURL': process.env.OPENSPY_API_URL,
            method: "POST",
            headers: {APIKey: process.env.OPENSPY_API_KEY},
            data: request_body
          };

          axios(axios_request).then(function(response) {
            var data = response.data;
            if(data.error != undefined) {
                resolve(false);
            } else {
                resolve(response);
            }
        }.bind(this), reject);
    });
}
function GetUsermodesByChannelmask(channel_mask) {
    return new Promise(function(resolve, reject) {
        var request_body = {
            "channelmask": channel_mask
        }
        var axios_request = {
            'url': "/v1/Usermode/lookup",
            'baseURL': process.env.OPENSPY_API_URL,
            method: "POST",
            headers: {APIKey: process.env.OPENSPY_API_KEY},
            data: request_body
          };

          axios(axios_request).then(function(response) {
            var data = response.data;
            if(data.error != undefined) {
                resolve(false);
            } else {
                resolve(response);
            }
        }.bind(this), reject);
 
    });
}
function DeleteUsermodeById(usermodeid) {
    return new Promise(function(resolve, reject) {
        var request_body = {
            "id": usermodeid
        }
        var axios_request = {
            'url': "/v1/Usermode",
            'baseURL': process.env.OPENSPY_API_URL,
            method: "DELETE",
            headers: {APIKey: process.env.OPENSPY_API_KEY},
            data: request_body
          };

          axios(axios_request).then(function(response) {
            var data = response.data;
            if(data.error != undefined) {
                resolve(false);
            } else {
                resolve(response);
            }
        }.bind(this), reject);
 
    });
}
function DeleteChanpropsByChannel(channel_name) {
    return new Promise(function(resolve, reject) {
        var request_body = {
            "channelmask": channel_name
        }
        var axios_request = {
            'url': "/v1/Chanprops",
            'baseURL': process.env.OPENSPY_API_URL,
            method: "DELETE",
            headers: {APIKey: process.env.OPENSPY_API_KEY},
            data: request_body
          };

          axios(axios_request).then(function(response) {
            var data = response.data;
            if(data.error != undefined) {
                resolve(false);
            } else {
                resolve(response);
            }
        }.bind(this), reject);
 
    });
}
module.exports = {ValidatePassword, CreateChanProps, CreateUsermode, GetChanProps, GetUsermodesByChannelmask, DeleteUsermodeById, DeleteChanpropsByChannel};