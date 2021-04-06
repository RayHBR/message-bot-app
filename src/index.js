const fetch = require("node-fetch");


module.exports = async function App(context) {
  var text = context.event.text;
  if (/[Hh][Ii]/g.test(text) && !/[a-zA-Z0-9][Hh][Ii]|[Hh][Ii][a-zA-Z0-9]/g.test(text)) {
    return SayHi;
  }
  else if (text.indexOf("楷翊") != -1) {
    return YeReply;
  }
  else if (text.indexOf("星爆") != -1) {
    await context.sendDocument('https://raw.githubusercontent.com/RayHBR/message-bot-app/main/images/%E6%98%9F%E7%88%86%E8%87%89.gif');
  }
  else if (text == '明天天氣') {
    return Weather;
  }
  else if (context.session.platform == 'telegram' && text == '你要被移除了RayBot') {
    if (context.event.message.from.firstName == 'Ray') {
      await context.sendText(`不要殺我嗚嗚嗚嗚`);
    }
    else if (context.event.message.from.firstName == 'kaiyeee') {
      await context.sendText(`就是你要殺我!!!`);
    }
  }
}

async function SayHi(context) {
  if (context.session.platform == 'telegram') {
    await context.sendText(`Hi, ${context.event.message.from.firstName}.`);
  }
  else if (context.session.platform == 'line') {
    await context.sendText(`Hi.`);
  }
  else {
    await context.sendText(`Hi.`);
  }
}

async function YeReply(context) {
  var YeReply = Array("楷yeeeeeeee", "@kaiyeee", "呼叫yee");
  await context.sendText(YeReply[Math.floor(Math.random() * YeReply.length)]);
}

function Weather(context) {
  var Today = new Date();
  console.log(Today.getHours())
  if (Today.getHours() > 0) {
    Today.setDate(Today.getDate() + 1);
  }
  var year = Today.getFullYear();
  var month = (Today.getMonth() + 1 < 10 ? '0' : '') + (Today.getMonth() + 1);
  var day = (Today.getDate() < 10 ? '0' : '') + Today.getDate();
  const url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.WEATHER_TOKEN}&format=JSON&locationName=新北市&startTime=${year}-${month}-${day}T06:00:00`
  fetch(encodeURI(url), {method:'GET'})
  .then(res => {
      return res.text();
  }).then(async result => {
      var results = JSON.parse(result).records.location[0];
      var Wx = results.weatherElement[0].time[0].parameter.parameterName;
      var PoP = results.weatherElement[1].time[0].parameter.parameterName;
      var MinT = results.weatherElement[2].time[0].parameter.parameterName;
      var CI = results.weatherElement[3].time[0].parameter.parameterName;
      var MaxT = results.weatherElement[4].time[0].parameter.parameterName;
      await context.sendText(`${year}/${month}/${day} 天氣預報`);
      await context.sendText(`${Wx} 最低溫度：${MinT} 最高溫度：${MaxT} 降雨機率：${PoP}% ${CI}`);
  });
}