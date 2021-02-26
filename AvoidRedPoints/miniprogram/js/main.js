import Player     from './player/index'
import Enemy      from './npc/enemy'
import GameInfo   from './runtime/gameinfo'
import Music      from './runtime/music'
import DataBus    from './databus'
import Global     from './utils/global'
import Bomb       from './props/bomb'

let ctx   = canvas.getContext('2d')
let databus = new DataBus()

wx.cloud.init({
   env: 'red-point-env1993',
})
const db = wx.cloud.database()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId    = 0
    this.personalHighScore = null

    this.restart()
    this.login()
  }

  login() {
    // 获取 openid
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        window.openid = res.result.openid
        this.prefetchHighScore()
      },
      fail: err => {
        console.error('get openid failed with error', err)
      }
    })
  }

  prefetchHighScore() {
    // 预取历史最高分
    db.collection('score').doc(`${window.openid}-score`).get()
      .then(res => {
        if (this.personalHighScore) {
          if (res.data.max > this.personalHighScore) {
            this.personalHighScore = res.data.max
          }
        } else {
          this.personalHighScore = res.data.max
        }
      })
      .catch(err => {
        console.error('db get score catch error', err)
        this.prefetchHighScoreFailed = true
      })
  }

  restart() {
    
    wx.startAccelerometer({
      interval: "game",
    })
    
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.player   = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music    = new Music()

    this.bindLoop     = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if ( databus.frame % 30 == 0 ) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init()
      databus.enemys.push(enemy)
    }
  }

  propGenerate(){
    if(databus.frame % databus.propGenerateInterval == 0)
    {
      let prop = databus.pool.getItemByClass('bomb', Bomb)
      prop.init()
      databus.props.push(prop)
    }
  }
  // 全局碰撞检测
  collisionDetection() {
    let that = this
    /*
    databus.bullets.forEach((bullet) => {
      for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
        let enemy = databus.enemys[i]

        if ( !enemy.isPlaying && enemy.isCollideWith(bullet) ) {
          enemy.playAnimation()
          that.music.playExplosion()

          bullet.visible = false
          databus.score  += 1

          break
        }
      }
    })
    */
    for (let i = 0,il = databus.props.length; i < il; i++) {
      let prop = databus.props[i];
      if(this.player.isCollideWith(prop))
      {
        prop.onPlayerCollision()
      }
    }

    for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
      let enemy = databus.enemys[i]

      if ( this.player.isCollideWith(enemy) ) {
        databus.gameOver = true

        // 获取历史高分
        if (this.personalHighScore) {
          if (databus.score > this.personalHighScore) {
            this.personalHighScore = databus.score
          }
        }

        // 上传结果
        // 调用 uploadScore 云函数
        wx.cloud.callFunction({
          name: 'uploadScore',
          // data 字段的值为传入云函数的第一个参数 event
          data: {
            score: databus.score
          },
          success: res => {
            if (this.prefetchHighScoreFailed) {
              this.prefetchHighScore()
            }
          },
          fail: err => {
            console.error('upload score failed', err)
          }
        })

        break
      }
    }
  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
     e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (   x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY  )
      this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    databus.bullets
          .concat(databus.enemys)
          .concat(databus.props)
          .forEach((item) => {
              item.drawToCanvas(ctx)
            })
    
    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if ( ani.isPlaying ) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)
    this.gameinfo.renderDebugInfo(ctx, this.player)
    // 游戏结束停止帧循环
    if ( databus.gameOver ) {
      this.gameinfo.renderGameOver(
        ctx, 
        databus.score,
        this.personalHighScore
      )

      if ( !this.hasEventBind ) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update(delta) {
    if ( databus.gameOver )
      return;
    this.player.update(delta)
    databus.bullets
           .concat(databus.enemys)
           .concat(databus.props)
           .forEach((item) => {
              item.update(this.player.x,this.player.y)
            })

    this.enemyGenerate()
    this.propGenerate()
    //this.collisionDetection()
  }

  // 实现游戏帧循环
  loop(delta) {
    databus.frame++

    this.update(delta)
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
