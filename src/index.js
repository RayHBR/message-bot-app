module.exports = async function App(context) {
  var text = context.event.text;
  if (text.indexOf('HI') != -1 || text.indexOf('hi') != -1 || text.indexOf('Hi') != -1 || text.indexOf('hI') != -1) {
    return SayHi;
  }
  else if (text.indexOf("楷翊") != -1) {
    return YeReply;
  }
  else if (text.indexOf("yee") != -1) {
    return YeeReply;
  }
  else if (text.indexOf("星爆") != -1) {
    await context.sendDocument('https://raw.githubusercontent.com/RayHBR/message-bot-app/main/images/%E6%98%9F%E7%88%86%E8%87%89.gif');
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
  var YeReply = Array("楷yeeeeeeee", "@kaiyeee");
  await context.sendText(YeReply[Math.floor(Math.random() * YeReply.length)]);
}

async function YeeReply(context) {
  var YeeReply = Array("@kaiyeee: 4ni!!!", "是翊不是yee!!!!");
  await context.sendText(YeeReply[Math.floor(Math.random() * YeeReply.length)]);
}