import Prop   from 'propBase'
import DataBus  from '../databus'
import Global   from '../utils/global'

const Bomb_IMG_SRC = 'images/bullet.png'
const Bomb_WIDTH   = 25
const Bomb_HEIGHT  = 25

let databus = new DataBus()
export default class Bomb extends Prop {
  constructor() {
    super(Bomb_IMG_SRC, Bomb_WIDTH, Bomb_HEIGHT,"Bomb")
  }
  
  onPlayerCollision(){

  }
}