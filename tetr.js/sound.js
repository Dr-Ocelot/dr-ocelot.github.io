
var lastbgmTime = 0
var killAllbgm = false
function Sound() {
  
  var itworks = false;
  var piecetypes = "tgm,npm".split(",")
  var gametypes = "ppt,tgm,npm,yotipo,toj".split(",")
  var uitypes = "ppt,tgm,npm,yotipo,toj".split(",")
  var wavenames = "bravo,endingstart,erase1,erase2,erase3,erase4,gameover,garbage,lock,tspin0,tspin1,tspin2,tspin3,piece0,piece1,piece2,piece3,piece4,piece5,piece6,harddrop,move,rotate,initialrotate,hold,initialhold,ready,go,mastermode,marathon".split(",");
  var soundtypes = "game,ui,game,game,game,game,ui,game,game,game,game,game,game,piece,piece,piece,piece,piece,piece,piece,game,game,game,game,game,game,ui,ui,bgm,bgm".split(",");
  var waves = {};
  this.init = function (type) {
    itworks = false;
    if (itworks === false) {
      try {
        for (var i = 0; i < wavenames.length; i++) {
          var iname = wavenames[i];
          var wave = document.createElement("AUDIO");
          switch (soundtypes[i]) {
            case "game":
              wave.src = "se/game/" + gametypes[mySettings.Soundbank] + "/" + iname + ".wav";
              break;
            case "ui":
              wave.src = "se/ui/" + gametypes[mySettings.Soundbank] + "/" + iname + ".wav";
              break;
            case "piece":
              wave.src = "se/piece/" + piecetypes[mySettings.NextType] + "/" + iname + ".wav";
              break;
            case "bgm":
              wave.src = "bgm/" + iname + ".ogg";
              break;
          }
          wave.load();
          waves[iname] = wave;
        }
        itworks = true;
      } catch (e) {
        alert("sound doesn't work.")
      };
      //Loops and shit
      waves["mastermode"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 139.120
          this.play()
          
        }
        if (gameState !== 0 && gameState !== 4 && gameState !== 2) {
          this.pause();
        }
          else if (killAllbgm == true) {
          this.pause();
        }
         else if (paused == true) {
          this.volume = settings.MusicVol / 100 / 2;
        } else {
          this.volume = settings.MusicVol / 100;
          
        }

      }, false);
      
      waves["marathon"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 107.369
          this.play()
          
        }
        if (gameState !== 0 && gameState !== 4 && gameState !== 2) {
          this.pause();
        }
          else if (killAllbgm == true) {
          this.pause();
        }
         else if (paused == true) {
          this.volume = settings.MusicVol / 100 / 2;
        } else {
          this.volume = settings.MusicVol / 100;
          
        }

      }, false);
  
    }
  };
  this.playse = function (name, arg) {
    if (itworks) {
      try {
        if (typeof arg !== "undefined") {
          name += arg;
        }
        if (typeof waves[name] !== "undefined") {
          if (settings.Sound) {
            waves[name].volume = settings.Volume / 100;
            waves[name].currentTime = 0;
            waves[name].play();
          }
        }
      } catch (e) {
        console.error("sound error" + e.toString());
      }
    }
  }
  this.playbgm = function (name, time, arg) {
    
    if (itworks) {
      try {
        if (typeof arg !== "undefined") {
          name += arg;
        }
        if (typeof waves[name] !== "undefined") {
          if (settings.Sound) {
            //            waves[name].loop = true
            waves[name].volume = settings.MusicVol / 100;
            waves[name].currentTime = time;
            if (waves[name].paused !== false) {
               waves[name].play();
            }
           
          }
        }
      } catch (e) {
        console.error("sound error" + e.toString());
      }
    }

  }
}

var sound = new Sound();
