var usedHardDrop = false
function Piece() {
  this.x;
  this.y;
  this.pos = 0;
  this.tetro;
  this.index;
  this.gravity = gravityUnit;
  this.lockDelay = 0;
  this.lockDelayLimit = 30;
  this.are = 0;
  this.areLimit = 0;
  this.irsDir = 0;
  this.ihs = false;
  this.shiftDelay = 0;
  this.shiftDir = 0;
  this.shiftReleased = false;
  this.arrDelay = 0;
  this.held = false;
  this.finesse = 0;
  this.dirty = false;
  this.dead = true;
  this.rotateLimit = 0;
  this.moveLimit = 0;
  this.delayCounting = false;
}

var lineARE = 0;
var lineDrought = 0;
/**
 * Removes last active piece, and gets the next active piece from the grab bag.
 */
Piece.prototype.new = function(index) {
  // TODO if no arguments, get next grabbag piece
  //console.log("new irs"+this.irsDir+", ihs"+this.ihs);
  
  this.pos = RotSys[settings.RotSys].initinfo[index][2];
  this.x = ~~((stack.width - 4) / 2) + RotSys[settings.RotSys].initinfo[index][0];
  if (gametype === 8 || gametype === 9) {
    this.y = stack.hiddenHeight - 1 + RotSys[settings.RotSys].initinfo[index][1];
  } else {
    
    this.y = stack.hiddenHeight - 2 + RotSys[settings.RotSys].initinfo[index][1];

  }
  this.rotateLimit = 0;
  this.moveLimit = 0;
  this.delayCounting = false;
  this.index = index;
  this.tetro = [];
  this.held = false;
  this.ihs = false;
  this.finesse = 0;
  this.dirty = true;
  this.dead = false;
  
  if (settings.NextSound == 1) {
    sound.playse("piece"+preview.grabBag[0])
  }
  if (index == 0 && gametype === 8) {
    lineDrought = 0
    lineAmount++
    document.getElementById("ivalue").style.color = "#ffffff";
    $setText(statsIpieces, lineAmount)
  } else {
    lineDrought++;
    if (lineDrought >= 13) {
      document.getElementById("ivalue").style.color = "#ff0000";
      if (lineDrought < 25) {
//        sound.playse("drought")
      } else {
//        sound.playse("droughtintense")
      }
      $setText(statsIpieces, lineDrought);
    }
  }
  // TODO Do this better. Make clone object func maybe.
  //for property in pieces, this.prop = piece.prop
  if (this.irsDir !== 0) {
    sound.playse("initialrotate");
    var curPos = this.pos;
    var newPos = (this.pos+this.irsDir).mod(4);
    var offsetX =
      RotSys[settings.RotSys].offset[this.index][newPos][0] -
      RotSys[settings.RotSys].offset[this.index][curPos][0];
    var offsetY =
      RotSys[settings.RotSys].offset[this.index][newPos][1] -
      RotSys[settings.RotSys].offset[this.index][curPos][1];
    this.tetro = pieces[index].tetro[newPos];
    if (!this.moveValid(offsetX, offsetY, this.tetro)) {
      this.tetro = pieces[index].tetro[curPos];
    } else {
      this.x += offsetX;
      this.y += offsetY;
      this.pos = newPos;
    }
    this.irsDir = 0;
  } else {
    this.tetro = pieces[index].tetro[this.pos];
  }

  this.lockDelayLimit = setting['Lock Delay'][settings['Lock Delay']];
  if (gametype === 6) { //Death
    this.gravity = 20;
    if (level < 20) {
      this.lockDelayLimit = [
        30, 25, 22, 20, 20, 18, 17, 17, 15, 15,
        13, 13, 13, 13, 13, 12, 12, 12, 11, 11
      ][level];
    } else {
      this.lockDelayLimit = 11;
    }
  } else if (settings.Gravity !== 0) {
    this.gravity = gravityArr[settings.Gravity - 1];
  } else if (gametype === 1) { //Marathon
    if (level < 20) {
      this.gravity = [
        1/60, 1/30, 1/25, 1/20, 1/15, 1/12, 1/10, 1/8,  1/6,  1/6,
         1/4,  1/4,  1/3,  1/3,  1/3,  1/2,    1,   1,    2,    3
        ]
        [level];
    } else {
       this.gravity = 20;
       this.lockDelayLimit = ~~(30 * Math.pow(0.93, (Math.pow(level-20, 0.8)))); // magic!
    }
  } else if (gametype === 8) { //Classic
    if ( level <= 29 ) {
       this.gravity = [
        1/48, 1/43, 1/38, 1/33, 1/28, 1/23, 1/18, 1/13,  1/8,  1/6,
         1/5,  1/5,  1/5,  1/4,  1/4,  1/4, 1/3,  1/3,   1/3,  1/2,
             1/2, 1/2, 1/2, 1/2, 1/2, 1/2, 1/2, 1/2, 1/2, 1
        ]
        [level];
    } else {
      this.gravity = 1;
    }
     
             
  } else if (gametype === 9) { //tgm
    var base = 1/65536
    if (leveltgm >= 0) { //speed ramp
      this.gravity = (base * 1024)
    } if (leveltgm >= 30) {
      this.gravity = (base * 1536)
    } if (leveltgm >= 35) {
      this.gravity = (base * 2048)
    } if (leveltgm >= 40) {
      this.gravity = (base * 2560)
    } if (leveltgm >= 50) {
      this.gravity = (base * 3072)
    } if (leveltgm >= 60) {
      this.gravity = (base * 4096)
    } if (leveltgm >= 70) {
      this.gravity = (base * 8192)
    } if (leveltgm >= 80) {
      this.gravity = (base * 12288)
    } if (leveltgm >= 90) {
      this.gravity = (base * 16384)
    } if (leveltgm >= 100) {
      this.gravity = (base * 20480)
    } if (leveltgm >= 120) {
      this.gravity = (base * 24576)
    } if (leveltgm >= 140) {
      this.gravity = (base * 28672)
    } if (leveltgm >= 160) {
      this.gravity = (base * 32768)
    } if (leveltgm >= 170) {
      this.gravity = (base * 36865)
    } if (leveltgm >= 200) {
      this.gravity = (base * 1024)
    } if (leveltgm >= 220) {
      this.gravity = (base * 8192)
    } if (leveltgm >= 230) {
      this.gravity = (base * 16384)
    } if (leveltgm >= 233) {
      this.gravity = (base * 24576)
    } if (leveltgm >= 236) {
      this.gravity = (base * 32768)
    } if (leveltgm >= 239) {
      this.gravity = (base * 40960)
    } if (leveltgm >= 243) {
      this.gravity = (base * 49152)
    } if (leveltgm >= 247) {
      this.gravity = (base * 57344)
    } if (leveltgm >= 251) {
      this.gravity = 1;
    } if (leveltgm >= 300) {
      this.gravity = 2;
    } if (leveltgm >= 330) {
      this.gravity = 3;
    } if (leveltgm >= 360) {
      this.gravity = 4;
    } if (leveltgm >= 400) {
      this.gravity = 5;
    } if (leveltgm >= 420) {
      this.gravity = 4;
    } if (leveltgm >= 450) {
      this.gravity = 3;
    } if (leveltgm >= 500) {
      this.gravity = 20;
    } 
    
    const speedTableTGM = [
      {level:0, speed:20}
      ];
      
      
    if (leveltgm < 100) { //ghost visiblity
      settings.Ghost = 1;
    } else {
      settings.Ghost = 2;
    }
    
    if (leveltgm <= 499) {
      this.areLimit = 25;
      lineARE = 40;
      settings.DAS = 14;
      settings["Lock Delay"] = 30;
    } else if (leveltgm <= 599) {
      this.areLimit = 25;
      lineARE = 25;
      settings.DAS = 8;
      settings["Lock Delay"] = 30;
    } else if (leveltgm <= 699) {
      this.areLimit = 25;
      lineARE = 7;
      settings.DAS = 8;
      settings["Lock Delay"] = 30;
    } else if (leveltgm <= 799) {
      this.areLimit = 16;
      lineARE = 7;
      settings.DAS = 8;
      settings["Lock Delay"] = 30;
    } else if (leveltgm <= 899) {
      this.areLimit = 12;
      lineARE = 0;
      settings.DAS = 8;
      settings["Lock Delay"] = 30;
    } else if (leveltgm <= 999) {
      this.areLimit = 12;
      lineARE = 0;
      settings.DAS = 6;
      settings["Lock Delay"] = 17;
    } else if (leveltgm <= 1099) {
      this.areLimit = 6;
      lineARE = 6;
      settings.DAS = 6;
      settings["Lock Delay"] = 17;
    } else if (leveltgm <= 1199) {
      this.areLimit = 5;
      lineARE = 6;
      settings.DAS = 6;
      settings["Lock Delay"] = 15;
    } else {
      this.areLimit = 4;
      lineARE = 6;
      settings.DAS = 6;
      settings["Lock Delay"] = 15;
    } 
    
  }
    else { 
    this.gravity = gravityUnit;
  }
  if (gametype === 0){
    if(this.lockDelayLimit < 8) {
      this.lockDelayLimit = 8;
    }
  }
  
  // Check for blockout.
  if (!this.moveValid(0, 0, this.tetro)) {
    //this.dead = true; //show it?
    gameState = 9;
    $setText(msg,'BLOCK OUT!');
    menu(3);
    sound.playse("gameover");
    return;
  }
  
  //real 20G
  if(this.gravity >= 20) {
    this.checkFall();
  }
  landed = !this.moveValid(0, 1, this.tetro);
  if (flags.moveDown & keysDown) {
    var grav = gravityArr[settings['Soft Drop'] + 1];
    if (grav >= 20) // 20G softdrop = 20G gravity
      this.y += this.getDrop(grav);
    //piece.finesse++;
  }
  // die-in-one-frame!
  if(landed && (this.lockDelay >= this.lockDelayLimit)) {
    this.checkLock();
  }
  this.delayCounting = false;
}
Piece.prototype.tryKickList = function(kickList, rotated, newPos, offsetX, offsetY) {
  for (var k = 0, len = kickList.length; k < len; k++) {
    if (this.moveValid(
      offsetX + kickList[k][0],
      offsetY + kickList[k][1],
      rotated
    )) {
      this.x += offsetX + kickList[k][0];
      this.y += offsetY + kickList[k][1];
      this.tetro = rotated;
      this.pos = newPos;
      this.finesse++;
      break;
    }
  }
}
Piece.prototype.rotate = function(direction) {
  if (this.delayCounting === true) {
    this.rotateLimit++
  }
sound.playse("rotate");
  // Goes thorugh kick data until it finds a valid move.
  var curPos = this.pos.mod(4);
  var newPos = (this.pos + direction).mod(4);
  // Rotates tetromino.
  var rotated = pieces[this.index].tetro[newPos];
  var offsetX =
    RotSys[settings.RotSys].offset[this.index][newPos][0] -
    RotSys[settings.RotSys].offset[this.index][curPos][0];
  var offsetY =
    RotSys[settings.RotSys].offset[this.index][newPos][1] -
    RotSys[settings.RotSys].offset[this.index][curPos][1];
  if (settings.RotSys === 2 || settings.RotSys === 14) { //ARS, Plus
    var kickList = [];
    if (this.index === PieceI.index) {
      if(curPos === 1 || curPos === 3)
        kickList = [[ 0, 0],[+1, 0],[-1, 0],[+2, 0]];
      else
        kickList = [[ 0, 0],[ 0,-1],[ 0,-2]];
    } else {
      if (newPos === 0 ||
        ((this.index === PieceS.index || this.index === PieceZ.index) && newPos === 2)
      )
        kickList = [[ 0, 0],[+1, 0],[-1, 0],[ 0,-1]];
      else
        kickList = [[ 0, 0],[+1, 0],[-1, 0]];
    }
    this.tryKickList(kickList, rotated, newPos, offsetX, offsetY);
  } else {
    var kickIndex = [ 1, -1 ,2].indexOf(direction); // kickDataDirectionIndex
    var kickList;
    if(settings.RotSys === 0)
      kickList = WKTableSRS[this.index][kickIndex][curPos];
    else if (settings.RotSys === 1)
      kickList = WKTableCultris;
    else if (settings.RotSys === 15)
      kickList = WKTableDX[kickIndex][curPos]
    else
      kickList = WKTableDRS[kickIndex];
    this.tryKickList(kickList, rotated, newPos, offsetX, offsetY);
  }
}

Piece.prototype.checkShift = function() {
  // Shift key pressed event.
  if (keysDown & flags.moveLeft && !(lastKeys & flags.moveLeft)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = -1;
    this.finesse++;
  } else if (keysDown & flags.moveRight && !(lastKeys & flags.moveRight)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 1;
    
    this.finesse++;
  }
  // Shift key released event.
  if (this.shiftDir === 1 &&
  !(keysDown & flags.moveRight) && lastKeys & flags.moveRight && keysDown & flags.moveLeft) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = -1;
  } else if (this.shiftDir === -1 &&
  !(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft && keysDown & flags.moveRight) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 1;
  } else if (
  !(keysDown & flags.moveRight) && lastKeys & flags.moveRight && keysDown & flags.moveLeft) {
    this.shiftDir = -1;
  } else if (
  !(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft && keysDown & flags.moveRight) {
    this.shiftDir = 1;
  } else if ((!(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft) ||
             (!(keysDown & flags.moveRight) && lastKeys & flags.moveRight)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 0;
  }
  // Handle events
  /* farter */
  // here problem causes it taking 2 frames to move 1 grid even ARR=1
  var dascut = [false,true][(settings.DASCut || 0)]
  //if (dascut) {
  //  this.ShiftDir = 0;
  //  console.log("interrupt")
  //}
  if (this.shiftDir) {
    // 1. When key pressed instantly move over once.
    if (this.shiftReleased && settings.DAS !== 0) {
//      console.log("moveright")
      this.shift(this.shiftDir);
      this.shiftDelay++;
      this.shiftReleased = false;
    // 2. Apply DAS delay
    } else if (this.shiftDelay < settings.DAS) {
      this.shiftDelay++;
    // 3. Once the delay is complete, move over once.
    //     Increment delay so this doesn't run again.
    // if arr=0, repeat here, not entering 4
    // but if dascut, let shiftdelay == das + 1 and arrdelay = 0 which is not < arr
    } else if (this.shiftDelay === settings.DAS) {
      this.shift(this.shiftDir);
      if (settings.ARR !== 0 || dascut) this.shiftDelay++;
    // 4. Apply ARR delay
    } else if (this.arrDelay < settings.ARR) {
      this.arrDelay++;
    // 5. If ARR Delay is full, move piece, and reset delay and repeat.
    /*
    } else if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
    */
      if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
        this.shift(this.shiftDir);
//        console.log("moveright")
      }
    }
  }
  if (flags.moveLeft3 & keysDown && !(lastKeys & flags.moveLeft3)) {
    this.multiShift(-1, 3);
    this.finesse++;
  } else if (flags.moveRight3 & keysDown && !(lastKeys & flags.moveRight3)) {
    this.multiShift(1, 3);
    this.finesse++;
  }
}
Piece.prototype.shift = function(direction) {
  
  this.arrDelay = 0;
  if (settings.ARR === 0 && this.shiftDelay === settings.DAS) {
    
    while (true) {
      if (this.moveValid(direction, 0, this.tetro)) {
        
        this.x += direction;
        /* farter */ //instant das under 20G
        if(this.gravity >= 20) {
          this.checkFall();
        }
        if (flags.moveDown & keysDown) {
          var grav = gravityArr[settings['Soft Drop'] + 1];
          if (grav >= 20) // 20G softdrop vs. 20G das
            this.y += this.getDrop(grav);
          //piece.finesse++;
          
        }
      } else {
        break;
      }
    }
  } else if (this.moveValid(direction, 0, this.tetro)) {
    if (this.delayCounting == true) {
      this.moveLimit++
    }
    this.x += direction;
    sound.playse("move");
  }
}
Piece.prototype.multiShift = function(direction, count) {
  for (var i = 0; i < count && this.moveValid(direction, 0, this.tetro); ++i) {
    this.x += direction;
    if(this.gravity >= 20) {
      this.checkFall();
    }
    if (flags.moveDown & keysDown) {
      var grav = gravityArr[settings['Soft Drop'] + 1];
      if (grav >= 20) // 20G softdrop vs. 20G das
        this.y += this.getDrop(grav);
      //piece.finesse++;
    }
  }
}
Piece.prototype.shiftDown = function() {
  if (this.moveValid(0, 1, this.tetro)) {
    var grav = gravityArr[settings['Soft Drop'] + 1];
    if (grav > 1){
      
      this.y += this.getDrop(grav);
    }else{
      this.y += grav;
  }
  }
}
Piece.prototype.hardDrop = function() {
  if (gametype !== 8) {
    
    if (gameparams.classicRule === true) {
      usedHardDrop = false
    } else {
      sound.playse("harddrop");
      usedHardDrop = true
    }
    
    var distance = this.getDrop(2147483647);
    this.y += distance;
    score = score.add(bigInt(distance + this.lockDelayLimit - this.lockDelay));
    //statisticsStack();
    if (gameparams.classicRule !== true) {
      this.lockDelay = this.lockDelayLimit;
    }
    
  }
}
Piece.prototype.getDrop = function (distance) {
  if (gametype !== 8) {
    if (!this.moveValid(0, 0, this.tetro))
      return 0;
    for (var i = 1; i <= distance; i++) {
      if ((!this.moveValid(0, i, this.tetro)))
        return i - 1;
    }
    return i - 1;
  } else {
    if (!this.moveValid(0, 0, this.tetro))
      return 0;
    for (var i = 1; i <= distance; i++) {
      if ((!this.moveValid(0, i, this.tetro)))
        return i - 1;
    }
    return i - 1;
  }

}
Piece.prototype.hold = function () {
  if (gametype !== 8) {
    var temp = hold.piece;
    if (!this.held) {
      if (hold.piece !== void 0) {
        hold.piece = this.index;
        this.new(temp);
      } else {
        hold.piece = this.index;
        this.new(preview.next());
      }
      this.held = true;
      hold.draw();
    }
  }

}

var classicRuleDelayLast = 0;

/**
 * Checks if position and orientation passed is valid.
 *  We call it for every action instead of only once a frame in case one
 *  of the actions is still valid, we don't want to block it.
 */
Piece.prototype.moveValid = function(cx, cy, tetro) {
  cx = cx + this.x;
  cy = Math.floor(cy + this.y);

  for (var x = 0; x < tetro.length; x++) {
    for (var y = 0; y < tetro[x].length; y++) {
      if (tetro[x][y] && (
        (cx + x < 0 || cx + x >= stack.width || cy + y >= stack.height) ||
        (cy + y >=0 && stack.grid[cx + x][cy + y])
      )) {
        return false;
      }
    }
  }
  if (gametype === 9) {
    if (gameparams.classicRule !== true) {
      if (landed) {
        this.delayCounting = true;
        if (this.moveLimit < 11 && this.rotateLimit < 8) {
          this.lockDelay = 0;
        } else {
          
        }
      } else {
        this.lockDelay = 0;
      }
    } else {
      if (classicRuleDelayLast < Math.floor(this.y)) {
        this.lockDelay = 0;
      }
      classicRuleDelayLast = Math.floor(this.y) 
      
      
      if (landed) {
      } else {
//      this.lockDelay = 0;
    }
    }
    
  } else {
    this.lockDelay = 0;
  }
  
  return true;
}

Piece.prototype.checkFall = function() {
  var grav = this.gravity;
  if (grav > 1) {
    this.y += this.getDrop(grav);
  }
  else {
    this.y += grav;
  }
  /* farter */ // rounding problem
  if (Math.abs(this.y - Math.round(this.y))<0.000001)
    this.y = Math.round(this.y);
}

Piece.prototype.checkLock = function() {
  if (landed) {
    this.y = Math.floor(this.y); //@sega
    if (this.lockDelay >= this.lockDelayLimit) {
      this.dead = true;
      stack.addPiece(this.tetro);
      if (usedHardDrop === false) {
        if (gametype === 8) {
          scoreNes += Math.floor(classicSoftDrop);
          scoreNesRefresh();
          classicSoftDrop = 0;
          lastYFrame = 0;
        }
        sound.playse("lock");
        if (gameparams.classicRule == true) {
          this.lockDelay = 0;
        }
        
      }
      usedHardDrop = false
      this.dirty = true;
      if(gameState === 9){ // lockout! don't spawn next piece
        return;
      }else{
        this.held = false;
        /* farter */
        // Win?
        checkWin();
        if (gameState === 0 && piece.dead) { // still playing, then spawn the next piece
          // determine next ARE limit
          if (gametype === 6) { //Death
            if (level < 20) {
              this.areLimit = [
                18, 18, 18, 15, 15, 12, 12, 12, 12, 12,
                12, 12, 10, 10, 10,  8,  8,  8,  8,  8
              ][level];
            } else {
              this.lockDelayLimit = 11;
              this.areLimit = 6;
            }
          } else if (gametype === 8) {
            if (piece.y >= 21) {
              this.areLimit = 10
            } else if (piece.y >= 17) {
              this.areLimit = 12
            } else if (piece.y >= 13) {
              this.areLimit = 14
            } else if (piece.y >= 9) {
              this.areLimit = 16
            } else {
              this.areLimit = 18
            }
            if (lineClear !== 0) {
              this.areLimit += 17
            } 
          } else if (gametype === 9) {
              if (lineClear !== 0) {
                this.areLimit += lineARE;
              }
            }
          
          else {
            this.areLimit = 0;
          }
          if (this.areLimit === 0) { // IRS IHS not possible
            this.new(preview.next()); // may die-in-one-frame
            
          } else {
            gameState = 4;
            this.are = 0;
          }
        }
      }
      /* farter */
    }
  }
}
var lastYFrame = 0;
var classicSoftDrop = 0;
var classicGravTest = 0;
var classicStoredY = 0;
Piece.prototype.update = function () {
  landed = !this.moveValid(0, 1, this.tetro);
  
  if (!(this.moveLimit < 10 && this.rotateLimit < 8)) {
    this.lockDelay = this.lockDelayLimit;
  }
  
  if (gametype === 8) {
    if (flags.moveDown & keysDown) {
      
      if (lastYFrame !== 0) {
        classicSoftDrop += (piece.y - lastYFrame);
      }
      lastYFrame = piece.y
    } else {
      classicSoftDrop = 0;
    }
    if (landed) {
      
        if (flags.moveDown & keysDown) {
        classicGravTest += gravityArr[settings['Soft Drop']]
      }
        classicGravTest += classicStoredY;
        classicGravTest += this.gravity
        if (classicGravTest >= 1) {
          this.lockDelay = 99;
          classicGravTest = 0;
        }

    } else {
      this.y += this.gravity
      piece.y += classicGravTest;
      classicStoredY = piece.y % 1;
      classicGravTest = 0;
    }
  }
//  if (gametype === 9) {
//    if (this.moveLimit < 10 && this.rotateLimit < 8) {
//          console.log("okay!" + piece.moveLimit + " " + piece.rotateLimit)
//          this.lockDelay = 0;
//        } else {
//          this.lockDelay = this.lockDelayLimit;
//        }
//  }
  
  
  if (this.moveValid(0, 1, this.tetro) && gametype !== 8) {
    this.checkFall();
  }

  if (landed) {
    if ((flags.moveDown & keysDown) && (gametype === 9)) {
      if (gameparams.classicRule == true) {
        this.lockDelay = this.lockDelayLimit;
      } else {
        this.lockDelay += 3;
      }
        
    
  }
    this.lockDelay++;
  this.checkLock();
  }
}
var stepSEPlayed;
Piece.prototype.draw = function() {
  clear(activeCtx);
  if (!this.dead) {
    this.drawGhost();
    if (settings.Ghost !== 3) {
      var a = void 0;
      
      if (landed) {
        
        if (stepSEPlayed !== true && gametype !== 8) {
          sound.playse("step")
          stepSEPlayed = true
        }
        
        a = this.lockDelay / this.lockDelayLimit;
        if (this.lockDelayLimit === 0)
          a = 0;
        a = Math.pow(a,2)*0.5;
      } else {
        stepSEPlayed = false
      }
      draw(this.tetro, this.x, Math.floor(this.y) - stack.hiddenHeight, activeCtx, RotSys[settings.RotSys].color[this.index], a);
    }
  }
}

Piece.prototype.drawGhost = function() {
  activeCtx.globalAlpha = 0.4;
  if (settings.Ghost === 0 && !landed) {
    draw(this.tetro, this.x,
         Math.floor(this.y + this.getDrop(2147483647)) - stack.hiddenHeight, activeCtx, 0);
  } else if (settings.Ghost === 1 && !landed) {
    draw(this.tetro, this.x,
         Math.floor(this.y + this.getDrop(2147483647)) - stack.hiddenHeight, activeCtx, RotSys[settings.RotSys].color[this.index]);
  }
  activeCtx.globalAlpha = 1;
}

var piece = new Piece();
