const fetch = require("node-fetch");
const fs = require('fs')
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

var id = 'superUser', name='superUser';
var today = getDate();

module.exports = async function App(context) {
  var text = context.event.text;
  if (context.session.platform == 'telegram') {
    id = context.event.message.from.id;
    name = context.event.message.from.firstName;
  }

  if (/[Hh][Ii]/g.test(text) && !/[a-zA-Z0-9][Hh][Ii]|[Hh][Ii][a-zA-Z0-9]/g.test(text)) {
    await context.sendChatAction('typing');
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

  else if (text.indexOf("楷翊") != -1) {
    await context.sendChatAction('typing');
    var YeReply = Array("楷yeeeeeeee", "@kaiyeee", "呼叫yee");
    await context.sendText(YeReply[Math.floor(Math.random() * YeReply.length)]);
  }

  else if (text.indexOf("星爆") != -1) {
    await context.sendChatAction('typing');
    await context.sendDocument('https://raw.githubusercontent.com/RayHBR/message-bot-app/main/images/%E6%98%9F%E7%88%86%E8%87%89.gif');
  }

  else if (context.session.platform == 'telegram' && text == '你要被移除了RayBot') {
    if (context.event.message.from.firstName == 'Ray') {
      await context.sendText(`不要殺我嗚嗚嗚嗚`);
    }
    else if (context.event.message.from.firstName == 'Chang') {
      await context.sendText(`就是你要殺我!!!`);
    }
  }

  else if (text.toLowerCase() == '!point') {
    await context.sendChatAction('typing');
    select_sql = `SELECT * FROM USERS WHERE USERID = '${id}'`
    client.query(select_sql, async (err, res) => {
      if (err) await context.sendText(err);
      else {
        if (res.rows.length == 0) {
          insertUser(context, 0)
          await context.sendText(name + ' 你現在有 100 點！');
        }
        else {
          await context.sendText(name + ' 你現在有 ' + res.rows[0].point + ' 點！');
        }
      }
    })
  }

  else if (text.toLowerCase() == '!plus' && name == 'Ray') {
    await context.sendChatAction('typing');
    select_sql = `SELECT * FROM USERS WHERE USERID = '${id}'`
    client.query(select_sql, async (err, res) => {
      if (err) await context.sendText(err);
      else {
          updatePoint(context, res.rows[0].point, 10)
      }
    })
  }

  else if (text.toLowerCase() == '!1a2b') {
    await context.sendChatAction('typing');
    return Start_1A2B;
  }

  else if (/^[0-9]+$/.test(text) && text.length == 4 && context.state.count != 0) {
    await context.sendChatAction('typing');
    var A = 0
    var B = 0;
    var count = context.state.Count_1A2B + 1;
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
      select_sql = `SELECT * FROM USERS WHERE USERID = '${id}'`
      client.query(select_sql, async (err, res) => {
        if (err) await context.sendText(err);
        else {
          context.setState({
            Ans_1A2B: 0,
            Count_1A2B: 0,
          });
          if (res.rows.length == 0) {
            insertUser(context, 10)
          }
          else {
            updatePoint(context, res.rows[0].point, 10)
          }
          await context.sendText( name + ' 勝利了！一共猜了' + count + '次！');
        }
      })
    }
    else {
      context.setState({
        Count_1A2B: count,
      });
      await context.sendText(A + 'A' + B + 'B');
    }
  }

  else if (text == '!21'){
    Start_Poker(context, 'Blackjack');
  }

  else if (text == '明天天氣') {
    return Weather;
  }

  else if (/(^!stock [0-9][0-9][0-9][0-9])/.test(text)) {
    await context.sendChatAction('typing');
    return StockRealtime;
  }

  else if (text == '移除' && name == 'Ray'){
    create_sql = 'CREATE TABLE USERS(USERSEQ serial NOT NULL, USERID VARCHAR (20) NOT NULL PRIMARY KEY, USERNAME VARCHAR (20) NOT NULL, POINT NUMERIC NOT NULL, UPDATE_DATE DATE NOT NULL);'
    drop_sql= 'DROP TABLE IF EXISTS USERS;'
    insert_sql = `INSERT INTO USERS (USERID, USERNAME, POINT, UPDATE_DATE) VALUES ('1', 'TEST', '100' ,'${today}');`
    delete_sql = `DELETE FROM USERS WHERE USERID = 'superUser';`
    select_sql = 'SELECT * FROM USERS'
  }

  else if (context.state.State_Blackjack) {
    var State_Blackjack = context.state.State_Blackjack;
    await context.sendText(State_Blackjack)
    if (text.toLowerCase() == '!join' && State_Blackjack == 'start_Blackjack') {
      await context.sendChatAction('typing');
      var USERS_Blackjack = context.state.USERS_Blackjack;
      for (i = 0; i < USERS_Blackjack.length; i++) {
        if (USERS_Blackjack[i].id == id) {
          await context.sendText(name + " 你已經加入過了啦！");
          break;
        }
        else if (i == USERS_Blackjack.length - 1) {
          USERS_Blackjack.push({
            id: id,
            name: name,
            state: 'start', 
            pokers: [],
            point: 0
          })
          context.setState({
            USERS_Blackjack: USERS_Blackjack,
          });
          await context.sendText(name + " 歡迎您加入21點！");
          break;
        }
      }
    }
    else if (text.toLowerCase() == '!start' && State_Blackjack == 'start_Blackjack') {
      await context.sendChatAction('typing');
      Start_Blackjack(context)
    }
    else if (text == '!抽' && State_Blackjack == 'play_Blackjack') {
      var USERS_Blackjack = context.state.USERS_Blackjack;
      await context.sendChatAction('typing');
      await context.sendText(id)
      for (i = 0; i < USERS_Blackjack.length; i++) {
        await context.sendText(USERS_Blackjack[i].id)
        if (USERS_Blackjack[i].id == id) {
          if (USERS_Blackjack[i].state == 'start') {
            var point = USERS_Blackjack[i].point;
            var poker = context.state.Poker_Blackjack;
            var idx = Math.floor(Math.random()*poker.length);
            answer = poker[idx];
            poker.splice(idx, 1);
            USERS_Blackjack[i].pokers.push(answer)
            if (/(A)/.test(answer.substr(2,2)))
              point += 11;
            else if (/(10|J|Q|K)/.test(answer.substr(2,2)))
              point += 10;
            else
              point += parseInt(answer.substr(2,2));
            if (point > 21) {
              USERS_Blackjack[i].point = point;
              USERS_Blackjack[i].state = 'boom';
              await context.sendText(USERS_Blackjack[i].name + ' 抽到了' + answer + '，現在點數是 ' + point + '，你爆炸啦！');
            }
            else {
              USERS_Blackjack[i].point = point;
              context.setState({
                Poker_Blackjack: poker,
                USERS_Blackjack: USERS_Blackjack
              });
              await context.sendText(USERS_Blackjack[i].name + ' 抽到了' + answer + '，現在點數是 ' + point + '，還要繼續抽嗎？');
              break;
            }
          }
          else if (USERS_Blackjack[i].state == 'boom') {
            await context.sendText(USERS_Blackjack[i].name + ' 你已經爆炸了，不能抽囉！');
            break;
          }
          else if (USERS_Blackjack[i].state == 'skip') {
            await context.sendText(USERS_Blackjack[i].name + ' 你已經結束了，不能抽囉！');
            break;
          }
        }
        else if (i == USERS_Blackjack.length - 1) {
          await context.sendText(name + ' 你沒有加入遊戲！');
        }
      }
      for (i = 0; i < USERS_Blackjack.length; i++) {
        if (USERS_Blackjack[i].state == 'start') {
          continue;
        }
        else if (i == USERS_Blackjack.length - 1) {
          await context.sendChatAction('typing');
          await context.sendText('所有人都結束了！');
          End_Blackjack(context);
        }
      }
    }
    else if (text == '!不抽' && State_Blackjack == 'play_Blackjack') {
      var USERS_Blackjack = context.state.USERS_Blackjack;
      await context.sendChatAction('typing');
      for (i = 0; i < USERS_Blackjack.length; i++) {
        if (USERS_Blackjack[i].id == id) {
          var point = USERS_Blackjack[i].point;
          USERS_Blackjack[i].state = 'skip';
          context.setState({
            USERS_Blackjack: USERS_Blackjack
          });
          await context.sendText(USERS_Blackjack[i].name + ' 現在的點數是 ' + point + '！');
          break;
        }
        else if (i == USERS_Blackjack.length - 1) {
          await context.sendText(name + ' 你沒有加入遊戲！');
        }
      }
      for (i = 0; i < USERS_Blackjack.length; i++) {
        if (USERS_Blackjack[i].state == 'start') {
          continue;
        }
        else if (i == USERS_Blackjack.length - 1) {
          await context.sendChatAction('typing');
          await context.sendText('所有人都結束了！');
          End_Blackjack(context);
        }
      }
    }
    else if (text.toLowerCase() == '!end') {
      End_Blackjack(context)
    }
    else if (text == '!強制結束') {
      context.setState({
        Poker_Blackjack: [],
        State_Blackjack: false,
        USERS_Blackjack:[]
      });
      await context.sendChatAction('typing');
      await context.sendText("感謝大家遊玩21點！");
    }
  }
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

async function Start_Poker(context, game) {
  if (!context.state.State_Blackjack) {
    var suits = ['♠️', '♥️', '♦️', '♣️'];
    var number = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    var poker = [];
    for (i = 0; i < suits.length; i++) {
      for (j = 0; j < number.length; j++) {
        poker.push(suits[i] + number[j]);
      }
    }
    if (game == "Blackjack") {
      context.setState({
        Poker_Blackjack: poker,
        State_Blackjack: 'start_Blackjack',
        USERS_Blackjack:[{
          id: '0', 
          name: 'Bot',
          state: 'skip', 
          pokers: [],
          point: 0
        }]
      });
      await context.sendText('好了，現在輸入 !join 加入遊戲吧，確定人數後輸入 !start 開始遊戲！');
    }
  }
  else {
    await context.sendText('遊戲已經開始囉！');
  }
}

async function Start_Blackjack(context) {
  var USERS_Blackjack = context.state.USERS_Blackjack;
  var result = "";
  if (USERS_Blackjack.length == 1) {
    await context.sendText("還沒有人加入遊戲QQ");
  }
  else {
    await context.sendText("21點開始！輸入 !抽 可以抽牌，輸入 !不抽 代表結束歐！");
    for (i = 0; i < USERS_Blackjack.length; i++) {
      var point = USERS_Blackjack[i].point;
      var poker = context.state.Poker_Blackjack;
      var idx = Math.floor(Math.random()*poker.length);
      answer = poker[idx];
      poker.splice(idx, 1);
      if (/(A)/.test(answer.substr(2,2)))
        point += 11;
      else if (/(10|J|Q|K)/.test(answer.substr(2,2)))
        point += 10;
      else {
        point += parseInt(answer.substr(2,2));
      }
      USERS_Blackjack[i].pokers.push(answer)
      USERS_Blackjack[i].point = point;
      result += USERS_Blackjack[i].name + ' 抽到了' + answer + '，現在點數是 ' + point + '！\r\n';
      context.setState({
        Poker_Blackjack: poker,
        State_Blackjack: 'play_Blackjack',
        USERS_Blackjack: USERS_Blackjack
      });
    }
    await context.sendChatAction('typing');
    await context.sendText(result);
  }
}

async function End_Blackjack(context) {
  await context.sendChatAction('typing');
  var USERS_Blackjack = context.state.USERS_Blackjack;
  var winner = [];
  var winner_point = 0;
  for (i = 0; i < USERS_Blackjack.length; i++) {
    if (USERS_Blackjack[i].point <= 21 && USERS_Blackjack[i].point > winner_point) {
      winner_point = USERS_Blackjack[i].point;
      winner = [];
      winner.push(USERS_Blackjack[i]);
    }
    else if (USERS_Blackjack[i].point <= 21 && USERS_Blackjack[i].point == winner_point) {
      winner.push(USERS_Blackjack[i]);
    }
    if (USERS_Blackjack[i].state == 'start') {
      var point = USERS_Blackjack[i].point;
      await context.sendText(USERS_Blackjack[i].name + ' 還沒結束，現在點數是 ' + point + '，還要繼續抽嗎？');
      break;
    }
    else if (i == USERS_Blackjack.length - 1) {
      if (winner_point == 0) {
        await context.sendText('無人獲勝...')
      }
      else if (winner.length == 1) {
        await context.sendText('恭喜 ' + winner[0].name + ' 獲勝，點數為 ' + winner[0].point + '！');
      }
      else if (winner.length > 1) {
        var winner_name = '';
        for (j = 0; j < winner.length; j++) {
          winner_name += winner[j].name + ', ';
        }
        await context.sendText('恭喜 ' + winner_name.substr(0, winner_name.length - 2) + ' 平手，點數為 ' + winner[0].point + '！');
      }
      context.setState({
        Poker_Blackjack: [],
        State_Blackjack: false,
        USERS_Blackjack:[]
      });
      await context.sendChatAction('typing');
      await context.sendText("感謝大家遊玩21點！");
    }
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
      await context.sendChatAction('typing');
      await context.sendText(`${year}/${month}/${day} 天氣預報`);
      await context.sendChatAction('typing');
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

function getDate(){
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var Hours = date.getHours();
  var Minutes = date.getMinutes();
  var Seconds = date.getSeconds();
  if (month < 10) {
      month = "0" + month;
        }
  if (day < 10) {
       day = "0" + day;
        }
  return year + '-' + month + '-' + day + ' ' + Hours + ':' + Minutes + ':' + Seconds;
}

function insertUser(context, addPoint) {
  if (context.session.platform == 'telegram') {
    id = context.event.message.from.id;
    name = context.event.message.from.firstName;
  }
  insert_sql = `INSERT INTO USERS (USERID, USERNAME, POINT, UPDATE_DATE) VALUES ('${id}', '${name}', ${100 + addPoint} ,'${today}')`
  client.query(insert_sql);
}

function updatePoint(context, Point ,addPoint) {
  if (context.session.platform == 'telegram') {
    id = context.event.message.from.id;
    name = context.event.message.from.firstName;
  }
  update_sql = `UPDATE USERS SET POINT = ${parseInt(Point) + addPoint} WHERE USERID = '${id}'`
  client.query(update_sql);
}