import Sprite   from '../base/sprite'
import DataBus  from '../databus'

const screenWidth    = window.innerWidth
const screenHeight   = window.innerHeight

// 玩家相关常量设置
const PLAYER_IMG_SRC = 'images/hero.png'
const PLAYER_WIDTH   = 40
const PLAYER_HEIGHT  = 40

let databus = new DataBus()
const accScale = 0.2
export default class Player extends Sprite {
  constructor() {
    super(PLAYER_IMG_SRC, PLAYER_WIDTH, PLAYER_HEIGHT)

    // 玩家默认处于屏幕底部居中位置
    this.x = screenWidth / 2 - this.width / 2
    this.y = screenHeight - this.height - 30
    //加速度
    this.accx = 0
    this.accy = 0
    this.spx = 0
    this.spy = 0
    this.lastAngle = 0
    // 初始化事件监听
    this.initEvent()
  }

  /**
   * 玩家响应加速度事件
   * 改变战机的加速度
   */
  initEvent() {

    wx.onAccelerometerChange((result) => {
      this.accx = result.x * accScale
      this.accy = result.y * accScale
      //console.debug("x:" + this.dx + "y:" + this.dy)
    })
  }
  drawToCanvas(ctx) {
    if ( !this.visible )
      return
    //偏移90°
    var angle = 0
    if(this.spy == 0 && this.spx == 0)
    {
      angle = this.lastAngle
    }
    else
    {
      angle = Math.atan2(this.spy,-this.spx) - Math.PI * 0.5
      this.lastAngle = angle
    }
  
    ctx.translate(this.x - this.width / 2,this.y - this.height / 2)
    ctx.rotate(angle)   
    ctx.drawImage(
      this.img,
      0,
      0,
      this.width,
      this.height
    )
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  update(delta){
      this.spy += this.accy
      this.spx += this.accx
      this.x += this.spx
      this.y -= this.spy
      var halfWidth = this.width / 2
      var halfHeight = this.height / 2
      if(this.x <= halfWidth)
      {
        this.x = halfWidth
        this.spx = 0
      }
      else if(this.x >= screenWidth - halfWidth)
      {
        this.x = screenWidth - halfWidth
        this.spx = 0
      }
      if(this.y <= halfHeight)
      {
        this.y = halfHeight
        this.spy = 0
      }
      if(this.y >= screenHeight - halfHeight)
      {
        this.y = screenHeight - halfHeight
        this.spy = 0
      }
  }
}
