var playedLevelingbgm = [false, false, false, false, false]
var lastbgmTime = 0
var killAllbgm = false
function Sound() {
  
  var itworks = false;
  var piecetypes = "tgm,npm".split(",")
  var gametypes = "ppt,tgm,npm,yotipo,toj,nes".split(",")
  var uitypes = "ppt,tgm,npm,yotipo,tojnes".split(",")
  var wavenames = "drought,droughtintense,bravo,levelup,step,endingstart,erase1,erase2,erase3,erase4,gameover,garbage,lock,tspin0,tspin1,tspin2,tspin3,piece0,piece1,piece2,piece3,piece4,piece5,piece6,harddrop,move,rotate,initialrotate,hold,initialhold,ready,go,mastermode,marathon,normal1,normal2,normal3,normal4,normal5,normal6,retro,retropro".split(",");
  var soundtypes = "fixed,fixed,game,game,game,ui,game,game,game,game,ui,game,game,game,game,game,game,piece,piece,piece,piece,piece,piece,piece,game,game,game,game,game,game,ui,ui,bgm,bgm,bgm,bgm,bgm,bgm,bgm,bgm,bgm,bgm".split(",");
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
            case "fixed":
              wave.src = "se/fixed/" + iname + ".wav";
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
      
      waves["retro"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 54.8
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
      
      waves["retropro"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 54.8
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
      
      waves["normal6"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 67.200
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
      
       waves["normal5"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 60.631
          this.play()
          
        }
        if (level >= 25 && gametype === 1) {
          if (playedLevelingbgm[4] === false) {
            this.pause()
            sound.playbgm("normal6", 0)
            playedLevelingbgm[4] = true
          }
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
      
      waves["normal4"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 53.933
          this.play()
          
        }
        if (level >= 20 && gametype === 1) {
          if (playedLevelingbgm[3] === false) {
            this.pause()
            sound.playbgm("normal5", 0)
            playedLevelingbgm[3] = true
          }
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
      
      waves["normal3"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 69.818
          this.play()
          
        }
        if (level >= 15 && gametype === 1) {
          if (playedLevelingbgm[2] === false) {
            this.pause()
            sound.playbgm("normal4", 0)
            playedLevelingbgm[2] = true
          }
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
      
      waves["normal2"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 66.461
          this.play()
          
        }
        if (level >= 10 && gametype === 1) {
          if (playedLevelingbgm[1] === false) {
            this.pause()
            sound.playbgm("normal3", 0)
            playedLevelingbgm[1] = true
          }
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
      
      waves["normal1"].addEventListener('timeupdate', function () {
        var buffer = .3
        if (this.currentTime > this.duration - buffer) {
          this.currentTime -= 88
          this.play()
          
        }
        if (level >= 5 && gametype === 1) {
          if (playedLevelingbgm[0] === false) {
            this.pause()
            sound.playbgm("normal2", 0)
            playedLevelingbgm[0] = true
          }
          
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
