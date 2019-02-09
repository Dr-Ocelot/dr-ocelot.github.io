function Sound() {
  var itworks=false;
  var piecetypes="tgm,npm".split(",")
  var gametypes="ppt,tgm,npm,yotipo".split(",")
  var uitypes="ppt,tgm,npm,yotipo".split(",")
  var wavenames="bravo,endingstart,erase1,erase2,erase3,erase4,gameover,garbage,lock,tspin0,tspin1,tspin2,tspin3,piece0,piece1,piece2,piece3,piece4,piece5,piece6,harddrop,move,rotate,initialrotate,hold,initialhold,ready,go".split(",");
  var soundtypes="game,ui,game,game,game,game,ui,game,game,game,game,game,game,piece,piece,piece,piece,piece,piece,piece,game,game,game,game,game,game,ui,ui".split(",");
  var waves={};
  this.init=function(type){
    itworks=false;
    if(itworks===false){
      try{
        for(var i=0;i<wavenames.length;i++){
          var iname = wavenames[i];
          var wave = document.createElement("AUDIO");
          switch (soundtypes[i]) {
            case "game":
              wave.src="se/game/"+gametypes[mySettings.Soundbank]+"/"+iname+".wav";
              break;
            case "ui":
              wave.src="se/ui/"+gametypes[mySettings.Soundbank]+"/"+iname+".wav";
              break;
            case "piece":
              wave.src="se/piece/"+piecetypes[mySettings.NextType]+"/"+iname+".wav";
              break;
          }
          wave.load();
          waves[iname] = wave;
        }
        itworks=true;
      }catch(e){
        alert("sound doesn't work.")
      };
    }
  };
  this.playse=function(name,arg){
    if(itworks){
      try{
        if(typeof arg !== "undefined"){
          name+=arg;
        }
        if(typeof waves[name] !== "undefined"){
          if(settings.Sound){
            waves[name].volume=settings.Volume/100;
            waves[name].currentTime=0;
            waves[name].play();
          }
        }
      }
      catch(e){
        console.error("sound error"+e.toString());
      }
    }
  }
}

var sound = new Sound();