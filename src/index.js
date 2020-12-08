module.exports = async function App(context) {
  if (context.event.text.indexOf("hi") != -1 || context.event.text.indexOf("Hi") != -1 || context.event.text.indexOf("HI") != -1) {
    return SayHi;
  }
  else if (context.event.text.indexOf("楷翊") != -1) {
    return YeReply;
  }
  else if (context.event.text.indexOf("yee") != -1) {
    return YeeReply;
  }
  else if (context.event.text == "月亮") {
    return moonReply;
  }
  else if (context.event.text == "天氣") {
    return weatherReply;
  }
  else if (context.event.text == "生宵") {
    return zodiacReply;
  }
  else if (context.event.text == "智障") {
    await context.sendText("你才智障膩!")
  }
  else if (context.event.text == "白痴") {
    await context.sendText("你才白痴膩!")
  }
}

async function SayHi(context) {
  console.log(context)
  if (context.session.platform == 'telegram') {
    await context.sendText(`Hi, ${context.event.message.from.firstName}.`);
  }
  else if (context.session.platform == 'line') {
    console.log(context.event)
    await context.sendText(`Hi.`);
  }
}

async function YeReply(context) {
  var YeReply = Array("楷yeeeeeeee", "yeeeee", "恐龍4ni", "恐龍yeeeeee");
  await context.sendText(YeReply[Math.floor(Math.random() * YeReply.length)]);
}

async function YeeReply(context) {
  var YeeReply = Array("@kaiyeee: 4ni!!!", "是翊不是yee!!!!");
  await context.sendText(YeeReply[Math.floor(Math.random() * YeeReply.length)]);
}

async function moonReply(context) {
  var moonReply = Array("🌕🌖🌗🌘🌑🌒🌓🌔🌕", "🌑🌒🌓🌔🌕🌖🌗🌘🌑", "🌕🌖🌗🌘🌑", "🌑🌒🌓🌔🌕");
  await context.sendText(moonReply[Math.floor(Math.random() * moonReply.length)]);
}

async function weatherReply(context) {
  var weatherReply = Array("☀️🌤⛅️🌥☁️🌦🌧⛈🌩⚡️", "☀️🌤⛅️🌥☁️", "☁️🌦🌧⛈🌩⚡️");
  await context.sendText(weatherReply[Math.floor(Math.random() * weatherReply.length)]);
}

async function zodiacReply(context) {
  var zodiacReply = "🐭🐮🐯🐰🐲🐍🐴🐐🐒🐓🐕🐷";
  await context.sendText(zodiacReply);
}