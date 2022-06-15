const fetchP = import('node-fetch').then(mod => mod.default)
const fetch = (...args) => fetchP.then(fn => fn(...args))
//const fs = require('fs')
var pg = require("pg");
var client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

var id = '000000001', name = '元智幼稚園', chat_id = '000000001', type = 'superUser';
var today = getDate();

module.exports = async function App(context) {
  var text = context.event.text;
  var platform = context.session.platform;
  if (platform == 'telegram') {
    id = context.event.message.from.id;
    name = context.event.message.from.firstName;
    chat_id = context.event.message.chat.id;
    type = chat_id > 0 ? "User" : "Group";
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
  else if (text.indexOf("楷翊") != -1 && name == 'Ray') {
    await context.sendChatAction('typing');
    await context.sendText("@kaiyeee");
  }
  else if (/^(ㄅㄖ)$/.test(text)) {
    await context.sendChatAction('typing');
    await context.sendText("@Ray_Huang");
  }
  else if (text.indexOf("星爆") != -1) {
    await context.sendChatAction('typing');
    await context.sendDocument('https://raw.githubusercontent.com/RayHBR/message-bot-app/main/images/%E6%98%9F%E7%88%86%E8%87%89.gif');
  }
  else if (text == '明天天氣') {
    return Weather;
  }
  else if (/(^!stock [0-9][0-9][0-9][0-9])/.test(text)) {
    await context.sendChatAction('typing');
    return StockRealtime;
  }
  else if (text.toLowerCase() == 'point') {
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
  else if (text.toLowerCase() == "plus" && id == "226204113") {
    await context.sendChatAction("typing");
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
  else if (/^\d{4}$/.test(text)) {
    var select_sql = `SELECT * FROM GUESS_AB WHERE CHATID = '${chat_id}'`
    client.query(select_sql, async (err, res) => {
      if (err) await context.sendText(err);
      else if (res.rows[0].state != false && res.rows.length != 0) {
        var A = 0
        var B = 0;
        var count = parseInt(res.rows[0].count) + 1;
        text = text.split('');
        for (var i = 0; i < 4; i++) {
          var ans = res.rows[0].answer.split(',');
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
              if (res.rows.length == 0) {
                insertUser(context, 10)
              }
              else {
                updatePoint(context, res.rows[0].point, 10)
              }
              await context.sendChatAction('typing');
              var update_sql = `UPDATE GUESS_AB SET ANSWER='', COUNT=0, STATE=false, UPDATE_DATE='${today}' WHERE CHATID='${chat_id}'`
              client.query(update_sql)
              await context.sendText(name + ' 勝利了！一共猜了' + count + '次！');
            }
          })
        }
        else {
          await context.sendChatAction('typing');
          var update_sql = `UPDATE GUESS_AB SET COUNT='${count}', UPDATE_DATE='${today}' WHERE CHATID='${chat_id}'`
          client.query(update_sql)
          await context.sendText(A + 'A' + B + 'B');
        }
      }
    })
  }
  else if (text == '移除' && name == 'Ray') {
    /*create_sql = 'CREATE TABLE USERS(USERSEQ serial NOT NULL, USERID VARCHAR (9) NOT NULL PRIMARY KEY, USERNAME VARCHAR (100) NOT NULL, POINT NUMERIC NOT NULL, CREATE_DATE TIMESTAMP NOT NULL, UPDATE_DATE TIMESTAMP NULL);'
    create_sql = 'CREATE TABLE GUESS_AB(CHATID VARCHAR (15) NOT NULL PRIMARY KEY, ANSWER VARCHAR (7) NULL, COUNT NUMERIC NOT NULL, STATE Boolean NOT NULL, CREATE_DATE TIMESTAMP NOT NULL, UPDATE_DATE TIMESTAMP NULL);'    
    create_sql = 'CREATE TABLE BLACKJACK(CHATID VARCHAR (15) NOT NULL PRIMARY KEY, POKER VARCHAR (211) NULL, STATE VARCHAR (10) NOT NULL, CREATE_DATE TIMESTAMP NOT NULL, UPDATE_DATE TIMESTAMP NULL);'
    create_sql = 'CREATE TABLE BLACKJACK_DETAIL(CHATID VARCHAR (15) NOT NULL PRIMARY KEY, USERID VARCHAR (9), POKER VARCHAR (2) NOT NULL, STATE VARCHAR (10));'   
    drop_sql= 'DROP TABLE IF EXISTS USERS;'
    insert_sql = `INSERT INTO USERS (USERID, USERNAME, POINT, UPDATE_DATE) VALUES ('1', 'TEST', '100' ,'${today}');`
    delete_sql = `DELETE FROM USERS WHERE USERID = 'superUser';`
    select_sql = 'SELECT * FROM USERS'*/
  }
  else if (text == '!21') {
    await context.sendChatAction("typing");
    return Begin_Blackjack;
  }
  else if (text.toLowerCase() == '!join' || text.toLowerCase() == '!start' || text == '!抽' || text == '!不抽') {
    var select_sql = `SELECT 'BLACKJACK' AS name, STATE FROM BLACKJACK WHERE CHATID='${chat_id}'`;
    client.query(select_sql, async (err, res) => {
      if (err) await context.sendText(err);
      else {
        if (res.rowCount != 0) {
          if (res.rows[0]["state"] != "false") {
            if (text.toLowerCase() == "!join" && res.rows[0]["state"] == "start") {
              await context.sendChatAction('typing');
              return Join_Blackjack(context);
            }
            else if (text.toLowerCase() == '!start' && res.rows[0]["state"] == "start") {
              await context.sendChatAction('typing');
              return Start_Blackjack(context);
            }
            else if (text == '!抽' && res.rows[0]["state"] == 'play') {
              await context.sendChatAction('typing');
              return GetCard_Blackjack(context)
            }
            else if (text == '!不抽' && res.rows[0]["state"] == 'play') {
              await context.sendChatAction('typing');
              return StopCard_Blackjack(context)
            }
          }
        }
      }
    })
  }
  else if (text.toLowerCase() == 'info' && id == "000000001") {
    drop_sql = 'DROP TABLE IF EXISTS BLACKJACK;'
    drop_sql2 = 'DROP TABLE IF EXISTS BLACKJACK_DETAIL;'
    create_sql = 'CREATE TABLE BLACKJACK(CHATID VARCHAR (15) NOT NULL PRIMARY KEY, POKER VARCHAR (211) NULL, STATE VARCHAR (10) NOT NULL, CREATE_DATE TIMESTAMP NOT NULL);'
    create_sql2 = 'CREATE TABLE BLACKJACK_DETAIL(ID SERIAL PRIMARY KEY, CHATID VARCHAR (15) NOT NULL, USERID VARCHAR (9) NOT NULL, POKER VARCHAR (211) NOT NULL, POINT NUMERIC NOT NULL, STATE VARCHAR (10));'
    client.query(drop_sql);
    client.query(drop_sql2);
    client.query(create_sql);
    client.query(create_sql2);
    var suits = ['♠️', '♥️', '♦️', '♣️'];
    var number = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    var poker = [];
    for (i = 0; i < suits.length; i++) {
      for (j = 0; j < number.length; j++) {
        poker.push(suits[i] + number[j]);
      }
    }

    insert_sql = `INSERT INTO BLACKJACK (CHATID, POKER, STATE, CREATE_DATE) VALUES ('${chat_id}', '${poker.join(',')}', false, '${today}');`
    //context.sendText(poker.join(','));
    //client.query(insert_sql);
  }
  else if (text.toLowerCase() == 'info2' && id == "000000001") {
    select_sql = `SELECT BD.*, U.USERNAME FROM BLACKJACK_DETAIL BD LEFT JOIN USERS U ON BD.USERID = U.USERID WHERE BD.point=(SELECT MAX(point) AS point FROM BLACKJACK_DETAIL where chatid='-1001299333637' and point<=21)`;
    //select_sql = `SELECT MAX(point) AS point FROM BLACKJACK_DETAIL`;
    client.query(select_sql, async (err, res) => {
      console.log(res.rows)
    })
  }
  else if (text.toLowerCase() == 'info3' && id == "000000001") {
    
    delete_sql = `DELETE FROM BLACKJACK;`
    delete_sql2 = `DELETE FROM BLACKJACK_DETAIL;`
    client.query(delete_sql);
    client.query(delete_sql2);
  }
}

function getDate() {
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
function Weather(context) {
  var Today = new Date();
  if (Today.getHours() > 0) {
    Today.setDate(Today.getDate() + 1);
  }
  var year = Today.getFullYear();
  var month = (Today.getMonth() + 1 < 10 ? '0' : '') + (Today.getMonth() + 1);
  var day = (Today.getDate() < 10 ? '0' : '') + Today.getDate();
  const url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.WEATHER_TOKEN}&format=JSON&locationName=新北市&startTime=${year}-${month}-${day}T06:00:00`
  fetch(encodeURI(url), { method: 'GET' })
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
async function Start_1A2B(context) {
  var num = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var answer = '';
  for (var i = 0; i < 4; i++) {
    var idx = Math.floor(Math.random() * num.length);
    answer += num[idx] + ',';
    num.splice(idx, 1);
  }
  var select_sql = `SELECT * FROM GUESS_AB WHERE CHATID = '${chat_id}'`
  client.query(select_sql, async (err, res) => {
    if (err) await context.sendText(err);
    else {
      if (res.rows.length == 0) {
        var insert_sql = `INSERT INTO GUESS_AB (CHATID, ANSWER, COUNT, STATE, CREATE_DATE) VALUES ('${chat_id}', '${answer.substring(0, answer.length - 1)}', 0, '', '${today}')`
        client.query(insert_sql)
      }
      else {
        var update_sql = `UPDATE GUESS_AB SET ANSWER='${answer.substring(0, answer.length - 1)}', STATE=true, UPDATE_DATE='${today}' WHERE CHATID='${chat_id}'`
        client.query(update_sql)
      }
    }
  })
  await context.sendText('好了，開始吧！');
}
async function Begin_Blackjack(context) {
  var suits = ['♠️', '♥️', '♦️', '♣️'];
  var number = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var poker = [];
  for (i = 0; i < suits.length; i++) {
    for (j = 0; j < number.length; j++) {
      poker.push(suits[i] + number[j]);
    }
  }
  var select_sql = `SELECT * FROM BLACKJACK WHERE CHATID = '${chat_id}'`
  client.query(select_sql, async (err, res) => {
    if (err) await context.sendText(err);
    else {
      if (res.rowCount == 0) {
        var insert_sql = `INSERT INTO BLACKJACK (CHATID, POKER, STATE, CREATE_DATE) VALUES ('${chat_id}', '${poker.join(',')}', 'start', '${today}');`
        client.query(insert_sql)
        insert_sql = `INSERT INTO BLACKJACK_DETAIL (CHATID, USERID, POKER, POINT, STATE) VALUES ('${chat_id}', '000000001', '', 0, 'start')`;
        client.query(insert_sql);
        await context.sendText('好了，現在輸入 !join 加入遊戲吧，確定人數後輸入 !start 開始遊戲！');
      }
      else {
        await context.sendText('遊戲已經開始囉！');
      }
    }
  })
}
async function Join_Blackjack(context) {
  select_sql = `SELECT * FROM BLACKJACK_DETAIL WHERE CHATID='${chat_id}' AND USERID='${id}'`
  client.query(select_sql, async (err, res) => {
    if (res.rowCount == 0) {
      insert_sql = `INSERT INTO BLACKJACK_DETAIL (CHATID, USERID, POKER, POINT, STATE) VALUES ('${chat_id}', '${id}', '', 0, 'start')`;
      client.query(insert_sql);
      await context.sendText(name + " 歡迎您加入21點！");
    }
    else {
      await context.sendText(name + " 你已經加入過了啦！");
    }
  })
}
async function Start_Blackjack(context) {
  select_sql = `SELECT * FROM BLACKJACK WHERE CHATID='${chat_id}'`;
  client.query(select_sql, async (err, res) => {
    var poker = res.rows[0].poker.split(',');
    select_sql = `SELECT BD.*, U.USERNAME FROM BLACKJACK_DETAIL BD LEFT JOIN USERS U ON BD.USERID = U.USERID WHERE BD.CHATID='${chat_id}' AND BD.USERID!='000000001'`;
    client.query(select_sql, async (err, res_d) => {
      if (res_d.rowCount == 0) {
        await context.sendText("還沒有人加入遊戲QQ");
      }
      else {
        await context.sendText("21點開始，輸入 !抽 可以抽牌，輸入 !不抽 代表結束歐！");
        var result = "";
        for (i = 0; i < res_d.rowCount; i++) {
          var point = parseInt(res_d.rows[i].point);
          var idx = Math.floor(Math.random() * poker.length);
          var answer = poker[idx];
          poker.splice(idx, 1);
          if (/(A)/.test(answer.substr(2, 2)))
            point += 11;
          else if (/(10|J|Q|K)/.test(answer.substr(2, 2)))
            point += 10;
          else {
            point += parseInt(answer.substr(2, 2));
          }
          update_sql = `UPDATE BLACKJACK_DETAIL SET POKER='${answer}', POINT = ${parseInt(point)} WHERE CHATID='${chat_id}' AND USERID='${res_d.rows[i]['userid']}'`;
          client.query(update_sql);
          result += res_d.rows[i].username + ' 抽到了' + answer + '，現在點數是 ' + parseInt(point) + '！\r\n';
        }
        update_sql = `UPDATE BLACKJACK SET STATE = 'play' WHERE CHATID='${chat_id}'`;
        client.query(update_sql);
        await context.sendText(result);
      }
    });
  });
}
async function GetCard_Blackjack(context) {
  select_sql = `SELECT * FROM BLACKJACK WHERE CHATID='${chat_id}'`;
  client.query(select_sql, async (err, res) => {
    var poker = res.rows[0].poker.split(',');
    select_sql = `SELECT BD.*, U.USERNAME FROM BLACKJACK_DETAIL BD LEFT JOIN USERS U ON BD.USERID = U.USERID WHERE BD.CHATID='${chat_id}' AND BD.USERID='${id}'`;
    client.query(select_sql, async (err, res_d) => {
      await context.sendChatAction('typing');
      if (res_d.rows.length == 0) {
        await context.sendText(name + ' 你沒有加入遊戲！');
      }
      else {
        var USERS_Blackjack = res_d.rows[0];
        if (USERS_Blackjack.state == 'start') {
          var point = parseInt(USERS_Blackjack.point);
          var idx = Math.floor(Math.random() * poker.length);
          answer = poker[idx];
          poker.splice(idx, 1);
          user_poker = USERS_Blackjack.poker.split(',');
          user_poker.push(answer)
          if (/(A)/.test(answer.substr(2, 2)))
            point += 11;
          else if (/(10|J|Q|K)/.test(answer.substr(2, 2)))
            point += 10;
          else
            point += parseInt(answer.substr(2, 2));
          if (point > 21) {
            update_sql = `UPDATE BLACKJACK_DETAIL SET POKER='${user_poker}', POINT = ${point}, STATE='boom' WHERE CHATID='${chat_id}' AND USERID='${id}'`;
            client.query(update_sql);
            await context.sendText(USERS_Blackjack.username + ' 抽到了' + answer + '，現在點數是 ' + point + '，你爆炸啦！');
          }
          else {
            USERS_Blackjack.point = point;
            update_sql = `UPDATE BLACKJACK_DETAIL SET POKER='${user_poker}', POINT = ${point} WHERE CHATID='${chat_id}' AND USERID='${id}'`;
            client.query(update_sql);
            await context.sendText(USERS_Blackjack.username + ' 抽到了' + answer + '，現在點數是 ' + point + '，還要繼續抽嗎？');
          }
        }
        else if (USERS_Blackjack.state == 'boom') {
          await context.sendText(USERS_Blackjack.username + ' 你已經爆炸了，不能抽囉！');
        }
        else if (USERS_Blackjack.state == 'skip') {
          await context.sendText(USERS_Blackjack.username + ' 你已經結束了，不能抽囉！');
        }
        else if (USERS_Blackjack.state == 'NYT') {
          await context.sendText(USERS_Blackjack.username + ' 還沒輪到你抽牌！');
        }
      }
      select_sql = `SELECT BD.*, U.USERNAME FROM BLACKJACK_DETAIL BD LEFT JOIN USERS U ON BD.USERID = U.USERID WHERE BD.CHATID='${chat_id}' AND BD.state='start' AND BD.USERID!='000000001'`;
      client.query(select_sql, async (err, res_d2) => {
        if (res_d2.rowCount == 0) {
          End_Blackjack(context)
        }
      })
    });
  });
}
async function StopCard_Blackjack(context) {
  select_sql = `SELECT BD.*, U.USERNAME FROM BLACKJACK_DETAIL BD LEFT JOIN USERS U ON BD.USERID = U.USERID WHERE BD.CHATID='${chat_id}' AND BD.USERID='${id}'`;
  client.query(select_sql, async (err, res_d) => {
    await context.sendChatAction('typing');
    if (res_d.rows.length == 0) {
      await context.sendText(name + ' 你沒有加入遊戲！');
    }
    else {
      var USERS_Blackjack = res_d.rows[0];
      if (USERS_Blackjack.state == 'start') {
        var point = parseInt(USERS_Blackjack.point);
        update_sql = `UPDATE BLACKJACK_DETAIL SET STATE='skip' WHERE CHATID='${chat_id}' AND USERID='${id}'`;
        client.query(update_sql);
        await context.sendText(USERS_Blackjack.username + ' 現在的點數是 ' + point + '！');
      }
      else if (USERS_Blackjack.state == 'boom') {
        await context.sendText(USERS_Blackjack.username + ' 你已經爆炸了！');
      }
      else if (USERS_Blackjack.state == 'skip') {
        await context.sendText(USERS_Blackjack.username + ' 你已經結束了！');
      }
    }
    select_sql = `SELECT BD.*, U.USERNAME FROM BLACKJACK_DETAIL BD LEFT JOIN USERS U ON BD.USERID = U.USERID WHERE BD.CHATID='${chat_id}' AND BD.state='start' AND BD.USERID!='000000001'`;
    client.query(select_sql, async (err, res_d2) => {
      if (res_d2.rowCount == 0) {
        End_Blackjack(context)
      }
    })
  });
}
async function End_Blackjack(context) {
  var select_sql = `SELECT * FROM BLACKJACK WHERE CHATID='${chat_id}'`;
  client.query(select_sql, async (err, res) => {
    var poker = res.rows[0].poker.split(',');
    select_sql = `SELECT BD.*, U.USERNAME FROM BLACKJACK_DETAIL BD LEFT JOIN USERS U ON BD.USERID = U.USERID WHERE BD.CHATID='${chat_id}' AND BD.USERID='000000001'`;
    client.query(select_sql, async (err, res_d) => {
      var USERS_Blackjack = res_d.rows[0];
      var point = parseInt(USERS_Blackjack.point);
      var user_poker = USERS_Blackjack.poker.split(',');
      var result = '';
      while (point <= 21) {
        var idx = Math.floor(Math.random() * poker.length);
        var temp_point = 0;
        answer = poker[idx];
        poker.splice(idx, 1);
        user_poker.push(answer)
        if (/(A)/.test(answer.substr(2, 2)))
          temp_point = 11;
        else if (/(10|J|Q|K)/.test(answer.substr(2, 2)))
          temp_point = 10;
        else
          temp_point = parseInt(answer.substr(2, 2));
        if (temp_point + point <= 21) {
          point += temp_point;
          update_sql = `UPDATE BLACKJACK_DETAIL SET POKER='${user_poker}', POINT = ${point} WHERE CHATID='${chat_id}' AND USERID='000000001'`;
          client.query(update_sql);
          await context.sendChatAction('typing');
          result += '元智幼稚園抽到了' + answer + '，現在點數是 ' + point + '！' + '\r\n';
        }
        else {
          result += '元智幼稚園不抽啦！';
          break;
        }
      }
      await context.sendText(result);
      select_sql = `SELECT BD.*, U.USERNAME FROM BLACKJACK_DETAIL BD LEFT JOIN USERS U ON BD.USERID = U.USERID WHERE BD.point=(SELECT MAX(point) AS point FROM BLACKJACK_DETAIL WHERE chatid='${chat_id}' AND point<=21)`;
      client.query(select_sql, async (err, res_2) => {
        if (res_2.rowCount > 1) {
          var winner_name = '';
          for (i = 0; i < res_2.rowCount; i++) {
            winner_name += res_2.rows[i]['username'] + ', ';
          }
          await context.sendText(`恭喜 ${winner_name.substr(0, winner_name.length - 2)} 平手，點數為 ${res_2.rows[0]['point']}！`);
        }
        else {
          await context.sendText(`恭喜 ${res_2.rows[0]['username']} 獲勝，點數為 ${res_2.rows[0]['point']}！`);
        }
        delete_sql = `DELETE FROM BLACKJACK WHERE chatid='${chat_id}';`
        delete_sql2 = `DELETE FROM BLACKJACK_DETAIL WHERE chatid='${chat_id}';`
        client.query(delete_sql);
        client.query(delete_sql2);
      })
    })
  })
  
 
}
function StockRealtime(context) {
  var num = context.event.text.split(' ')
  const url = `https://stock-bot-app.herokuapp.com/StockRealtime/${num[1]}`
  //const url = `http://127.0.0.1:5000/StockRealtime/${num[1]}`
  fetch(encodeURI(url), { method: 'GET' })
    .then(res => {
      return res.text();
    }).then(async result => {
      var rt = JSON.parse(result);
      if (rt.success == true) {
        var name = rt.info.name;
        var price = rt.realtime.latest_trade_price
        if (price == '-') {
          await context.sendText(`${name}: - (`);
        }
        else {
          await context.sendText(`${name}: ${price}`);
        }
      }
      else {
        await context.sendText(`股票代號有誤！`);
      }
    });
}
function insertUser(context, addPoint) {
  if (context.session.platform == 'telegram') {
    id = context.event.message.from.id;
    name = context.event.message.from.firstName;
  }
  insert_sql = `INSERT INTO USERS (USERID, USERNAME, POINT, CREATE_DATE) VALUES ('${id}', '${name}', ${100 + addPoint} ,'${today}')`
  client.query(insert_sql);
}
function updatePoint(context, Point, addPoint) {
  if (context.session.platform == 'telegram') {
    id = context.event.message.from.id;
    name = context.event.message.from.firstName;
  }
  update_sql = `UPDATE USERS SET POINT = ${parseInt(Point) + addPoint}, UPDATE_DATE='${today}' WHERE USERID = '${id}'`
  client.query(update_sql);
}