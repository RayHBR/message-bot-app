const fetch = require("node-fetch");

const url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-459C0E19-B48C-4564-A8A6-AC00FC0F0BF9&format=JSON&locationName=新北市`;

fetch(encodeURI(url), {method:'GET'})
.then(res => {
    return res.text();
}).then(result => {
    console.log(result);
});