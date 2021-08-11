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
  else if (context.session.platform == 'telegram' && text == '你要被移除了RayBot') {
    if (context.event.message.from.firstName == 'Ray') {
      await context.sendText(`不要殺我嗚嗚嗚嗚`);
    }
    else if (context.event.message.from.firstName == 'kaiyeee') {
      await context.sendText(`就是你要殺我!!!`);
    }
  }
  else if (text == '!Point') {
    var userPoint = JSON.parse(context.state.Point);
    var result = '';
    for (i = 0; i < Object.keys(userPoint).length; i++) {
      result += Object.keys(userPoint)[i] + '：' + userPoint[Object.keys(userPoint)[i]] + '\r\n';
    }
    await context.sendText(result);
  }
  else if (text == '!1A2B') {
    return Start_1A2B;
  }
  else if (/^[0-9]+$/.test(text) && text.length == 4 && context.state.count != 0) {
    return Guess_1A2B;
  }
  else if (text == '!weather') {
    return Weather;
  }
  else if (/(^!stock [0-9][0-9][0-9][0-9])/.test(text)) {
    return StockRealtime;
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

async function Start_1A2B(context) {
  var num = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var answer = '';
  for (var i = 0; i < 4; i++) {
    var idx = Math.floor(Math.random()*num.length);
    answer += num[idx] + ',';
    num.splice(idx, 1);
  }
  context.setState({
    Ans_1A2B: answer.substring(0, answer.length - 1),
  });
  await context.sendText('好了，開始吧！');
}

async function Guess_1A2B(context) {
  var name = context.event.message.from.firstName;
  var A = 0
  var B = 0;
  text = text.split('');
  for (var i = 0; i < 4; i++) {
    var ans = context.state.Ans_1A2B.split(',')
    var idx = ans.indexOf(text[i]);
    if (idx != -1) {
        if (idx == i)
          A++;
        else
          B++;
    }
  }
  if (A == 4) {
    var userPoint =JSON.parse(context.state.Point);
    userPoint[name] = userPoint[name] + 10
    context.setState({
      Ans_1A2B: 0,
      Point: JSON.stringify(userPoint),
    });
    await context.sendText('勝利！');
  }
  else {
    await context.sendText(A + 'A' + B + 'B');
  }
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

function StockRealtime(context) {
  var num = context.event.text.split(' ')
  const url = `https://stock-bot-app.herokuapp.com/StockRealtime/${num[1]}`
  //const url = `http://127.0.0.1:5000/StockRealtime/${num[1]}`
  fetch(encodeURI(url), {method:'GET'})
  .then(res => {
    return res.text();
  }).then(async result => {
    var rt = JSON.parse(result);
    if (rt.success == true) {
      var name = rt.info.name;
      var price = rt.realtime.latest_trade_price
      if (price == '-') 
      {
        await context.sendText(`${name}: - (`);
      }
      else 
      {
        await context.sendText(`${name}: ${price}`);
      }
    }
    else {
      await context.sendText(`股票代號有誤!`);
    }
  });
}