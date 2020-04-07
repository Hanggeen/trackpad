import Pointer from './src/components/pointer/';
import Scroller from './src/modules/scroller';
import Boarder from './src/components/board/';
import Server from './src/modules/server';

class Touchbar {
  /**
   * 构造函数
   * @param {Object} config 
   * config.gesture {boolean} false
   */
  constructor(config = {}) {
    this.url = config.host || `${window.location.protocol}${window.location.host}`;
    this.gesture = config.gesture || false;

    this.pointer = new Pointer();
    this.scroller = new Scroller();
    this.board = new Boarder();

    const wsurl = document.location.protocol === 'https:' ? `wss://${this.url}/listener` : `ws://${this.url}/listener`;
    const server = new Server(wsurl);
    server.init(wsurl).then(res => {
      if (res) {
        this.board.initQrcode(`${window.location.protocol}//${window.location.host}/pad.html?ws=${this.url}&co=${res.data}`);
      }
    })

    this.board.clickHandler(() => {
      if (server.work) {
        if (this.board._qrcode.style.display === 'none') {
          this.board._qrcode.style.display = 'block';
        } else {
          this.board._qrcode.style.display = 'none';
        }
      } else {
        // TODO 重连
      }
    })

    server.messageHandler(msg => {
      if (msg.type === 'track') {
        if (msg.track.action === "scroll") {
          this.scroller.set(msg.track.data.y);
        }
        if (msg.track.action === "touch") {
          this.pointer.set(msg.track.data.x, msg.track.data.y);
        }
        if (msg.track.action === "click") {
          this.pointer.click();
        }
      }
      if (msg.type === 'msg') {
        if (msg.action === 'join') {
          this.board.toast('新建立连接');
          this.board.setQrcodeVisible(false);
          this.board.tips('已连接');
          this.pointer.show();
        }
        if (msg.action === 'quit') {
          this.board.toast('连接已断开');
          this.board.setQrcodeVisible(true);
          this.board.tips('未连接');
          this.pointer.hide();
        }
      }
    });

    server.errorHandler(err => {
      this.board.toast('失去连接');
      this.board.setQrcodeVisible(false);
      this.board.tips('点击重连');
      this.pointer.hide();
    });

    server.closeHandler(() => {
      this.board.toast('失去连接');
      this.board.setQrcodeVisible(false);
      this.board.tips('点击重连');
      this.pointer.hide();
    });
  }
}

export {Touchbar}