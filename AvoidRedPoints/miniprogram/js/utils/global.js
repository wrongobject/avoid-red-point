
export default class Global {

}
Global.rnd = function rnd(start, end){
  return Math.floor(Math.random() * (end - start) + start)
}