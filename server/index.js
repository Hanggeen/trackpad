const WebSocket = require("ws");
const fs = require('fs')
const httpServer = Config.ssl ? require('https') : require('http')

const Config = require("./config")

// http server
let server = null
if (Config.ssl) {
  server = httpServer.createServer({
    key: fs.readFileSync( Config.ssl_key ),
    cert: fs.readFileSync( Config.ssl_cert )
  }, function( req, res ) {
    res.writeHead(200);
    res.end("This is used for websocket!\n");
  }).listen( Config.port );
} else {
  server = httpServer.createServer( processRequest ).listen( Config.port );
}

// websocker server
const WebSocketServer = WebSocket.Server;
const wss = new WebSocketServer( { server } );

let STORE = {};

wss.on("connection", function(ws) {
  console.log("有新连接");
  let code = "";
  let connectiontype = '';
  ws.on("message", function(message) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (e) {
      ws.send(JSON.stringify({
        type: "msg",
        code: 1,
        action: 'error',
        data: "解析数据错误"
      }));
    }

    if (msg.type == 'center') {
      if (msg.action == 'init-listener') {
        if (STORE[msg.code]) {
          if (STORE[msg.code].listener && STORE[msg.code].listener.readyState == 1) {
            STORE[msg.code].listener.send(JSON.stringify({
              type: 'center',
              code: 2,
              action: 'error',
              data: '您已经被挤下线'
            }))
          }
          STORE[msg.data].listener = ws
        } else {
          STORE[msg.data] = {
            listener: ws
          };
        }
        code = msg.code
        connectiontype = 'listener'
        STORE[msg.code].listener.send(JSON.stringify({
          type: 'center',
          code: 0,
          action: 'init-listener',
          data: '接入成功'
        }))
      } else if (msg.action == 'init-poster') {
        if (STORE[msg.code]) {
          if (STORE[msg.code].poster && STORE[msg.code].poster.readyState == 1) {
            STORE[msg.code].poster.send(JSON.stringify({
              type: 'center',
              code: 2,
              action: 'error',
              data: '您已经被挤下线'
            }))
          }
          STORE[msg.data].poster = ws
        } else {
          STORE[msg.data] = {
            poster: ws
          };
        }
        code = msg.code
        connectiontype = 'poster'
        STORE[msg.code].poster.send(JSON.stringify({
          type: 'center',
          code: 0,
          action: 'init-poster',
          data: '接入成功'
        }))
        if (STORE[msg.code].listener && STORE[msg.code].listener.readyState == 1) {
          STORE[msg.code].listener.send(JSON.stringify({
            type: 'center',
            code: 0,
            action: 'connect',
            data: '接入成功'
          }))
        }
      }
    } else if (msg.type == 'post') {
      if (connectiontype == 'listener') {
        if (STORE[msg.code].poster != undefined) {
          STORE[msg.code].poster.send(message);
        } else {
          ws.send(JSON.stringify({
            type: "msg",
            code: 1,
            action: 'error',
            data: "此码未连接"
          }));
        }
      }
      if (connectiontype == 'poster') {
        if (STORE[msg.code].listener != undefined) {
          STORE[msg.code].listener.send(message);
        } else {
          ws.send(JSON.stringify({
            type: "msg",
            code: 1,
            action: 'error',
            data: "此码未连接"
          }));
        }
      }
    }
  });

  ws.on("close", function() {
    console.log(`${connectiontype == 'listener' ? '监听' : '发送'}关闭`)
    if (code && connectiontype == 'listener' && STORE[code].poster) {
      STORE[code].listener = null;
      if (STORE[code].poster && STORE[code].poster.readyState == 1) {
        STORE[code].poster.send(JSON.stringify({
          type: "msg",
          code: 1,
          action: 'error',
          data: "已断开连接诶"
        }))
      }
    }
    if (code && connectiontype == 'poster' && STORE[code].listener) {
      STORE[code].poster = null;
      if (STORE[code].listener && STORE[code].listener.readyState == 1) {
        STORE[code].listener.send(JSON.stringify({
          type: "center",
          code: 0,
          action: 'disconnect',
          data: "断开了一个连接"
        }))
      }
    }
  });
});

console.log("ready");
