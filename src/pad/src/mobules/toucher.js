
import Hammer from 'hammerjs';
export default class Toucher {
  constructor(dom) {
    this.dom = dom;
    this.dom.addEventListener("touchstart", this.touchStart.bind(this));
    this.dom.addEventListener("touchmove", this.touchMove.bind(this));
    const gestureDomHammer = new Hammer(this.dom, {});
    gestureDomHammer.on('tap', this.click.bind(this));
    this.touchCb = null;
  }
  
  // 开始触摸时，记住标记位置
  touchStart(e) {
    this.startX = e.touches[0].pageX;
    this.startY = e.touches[0].pageY;
  }

  // 滑动时，设置标记位置、计算差值、发送事件
  touchMove(e) {
    if (this.touchCb) {
      let X, Y;
      X = e.touches[0].pageX - this.startX;
      Y = e.touches[0].pageY - this.startY;
      X = Math.round(X * 100) / 100;
      Y = Math.round(Y * 100) / 100;
      this.startX = e.touches[0].pageX;
      this.startY = e.touches[0].pageY;
      this.touchCb({
        action: 'touch',
        data: {x:X, y:Y}
      });
    }
  }

  click() {
    if (this.touchCb) {
      this.touchCb({
        action: 'click'
      });
    }
  }

  listen(cb) {
    this.touchCb = cb;
  }

  show() {
    this.dom.style.display = 'block';
  }

  hide() {
    this.dom.style.display = 'none';
  }
}