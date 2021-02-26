import Animation from '../base/animation'
import DataBus   from '../databus'

const ENEMY_IMG_SRC = 'images/enemy.png'
const ENEMY_WIDTH   = 10
const ENEMY_HEIGHT  = 10
const Max_Speed = 1
const Min_Speed = 0.5
const __ = {
  speed: Symbol('speed')
}

let databus = new DataBus()

function rnd(start, end){
  return Math.floor(Math.random() * (end - start) + start)
}

export default class Enemy extends Animation {
  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT)

    this.initExplosionAnimation()
  }

  init() {
    this.x = rnd(0, window.innerWidth - ENEMY_WIDTH)
    this.y = rnd(0, window.innerHeight - ENEMY_HEIGHT)

    this[__.speed] = Math.random() * (Max_Speed - Min_Speed) + Min_Speed

    this.visible = true
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    let frames = []

    const EXPLO_IMG_PREFIX  = 'images/explosion'
    const EXPLO_FRAME_COUNT = 19

    for ( let i = 0;i < EXPLO_FRAME_COUNT;i++ ) {
      frames.push(EXPLO_IMG_PREFIX + (i + 1) + '.png')
    }

    this.initFrames(frames)
  }

  // 每一帧更新enemy位置
  update(px,py) {
    //this.y += this[__.speed]
    var deltax = px - this.x
    var deltay = py - this.y

    var tamp = Math.sqrt(deltax * deltax + deltay * deltay)
    var spx = deltax / tamp * this[__.speed]
    var spy = deltay / tamp * this[__.speed]

    this.x += spx * databus.pointSpeedScale
    this.y += spy * databus.pointSpeedScale
    // 对象回收
    if ( this.y > window.innerHeight + this.height )
      databus.removeEnemey(this)
    if ( this.y < -this.height )
      databus.removeEnemey(this)
  }
}
