

// 打开一个WebSocket:

var point = document.createElement('div');
point.setAttribute('style',  "position:fixed;width:5px;height:5px;background-color:#000;left:0px;top:0px;")

document.getElementsByTagName('body')[0].appendChild(point);

let ws = new WebSocket('ws://172.20.10.3:3000');

// 打开WebSocket连接后立刻发送一条消息:
ws.addEventListener('open', function () {
    ws.send(JSON.stringify({
      type: 'init-listener',
      data: 'first'
    }));
});

var X = 0, Y = 0;
// 响应收到的消息:
ws.addEventListener('message', function (message) {
    console.log(`收到消息: ${message.data}`);
    var msg = JSON.parse(message.data);
    if (msg.action == 'slide') {
      set(msg.data.x, msg.data.y);
    }
    if (msg.action == 'click') {
      console.log(Math.floor(X), Math.floor(Y))
      console.log(document.elementFromPoint(Math.floor(X), Math.floor(Y)))
      document.elementFromPoint(Math.floor(X)-6, Math.floor(Y)-6).click()
    }
})

function set(x, y) {
  console.log(x, y)
  X += x;
  Y += y;
  point.style.left = X + 'px';
  point.style.top = Y + 'px';
}

