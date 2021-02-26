import Sprite   from '../base/sprite'
import Global   from '../utils/global'
import DataBus  from '../databus'

const Step_Max = 20
const Step_Min = -20
let databus = new DataBus()
export default class PropBase extends Sprite {
  constructor(src,width,height,pType) {
    super(src, width, height)
    this.pType = pType
  }

  init(){
    this.x = Global.rnd(0, window.innerWidth - this.width)
    this.y = Global.rnd(0, window.innerHeight - this.height)
   
    this.visible = true
    this.randStep()
  }
  update(px,py){
    if(this.checkArriveTarget())
    {
      this.randStep()
    }
    else
    {
      var deltax = this.targetX - this.x
      var deltay = this.targetY - this.y

      var tamp = Math.sqrt(deltax * deltax + deltay * deltay)
      var spx = deltax / tamp
      var spy = deltay / tamp

      this.x += spx * databus.propSpeedScale
      this.y += spy * databus.propSpeedScale
      
      //console.debug("x:" + this.x + "y:" + this.y)
    }
    //超出边界 回收掉
    if(this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > window.innerHeight)
    {
      databus.removeProp(this.pType,this)
    }
  }

  randStep(){
    this.targetX = Global.rnd(Step_Min,Step_Max) + this.x
    this.targetY = Global.rnd(Step_Min,Step_Max) + this.y
  }

  checkArriveTarget(){
    if(Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1 )
    {
      return true      
    }
    else
    {
      return false
    }
  }
}