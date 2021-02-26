import Pool from './base/pool'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if ( instance )
      return instance

    instance = this

    this.pool = new Pool()

    this.reset()
  }

  reset() {
    this.frame      = 0
    this.score      = 0
    this.bullets    = []
    this.enemys     = []            //红点集合
    this.animations = []
    this.props      = []            //prop集合
    this.gameOver   = false         //是否结束
    this.pointSpeedScale = 0.1      //红点速度缩放
    this.propSpeedScale = 0.1       //prop速度缩放
    this.scoreScale = 1             //分数累计缩放
    this.propGenerateInterval = 90  //prop出生间隔 单位：帧
  }

  /**
   * 回收敌人，进入对象池
   * 此后不进入帧循环
   */
  removeEnemey(enemy) {
    let temp = this.enemys.shift()

    temp.visible = false

    this.pool.recover('enemy', enemy)
  }

  /**
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   */
  removeBullets(bullet) {
    let temp = this.bullets.shift()

    temp.visible = false

    this.pool.recover('bullet', bullet)
  }
/*
*回收prop,进入对象池
*/
  removeProp(ptype,prop){
    for (let index = 0; index < this.props.length; index++) {
      const element = this.props[index];
      if(prop == element)
      {
        this.props.splice(index,1)
        element.visible = false
        this.pool.recover(ptype, prop)
        break
      }
    }
    
  }
}
