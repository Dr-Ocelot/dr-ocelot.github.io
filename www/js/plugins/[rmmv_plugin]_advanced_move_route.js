//=============================================================================
// μ'ki's Advanced Move Route v1.02
// MK_AdvancedMove.js
//=============================================================================

var Imported = Imported || {};
Imported.MK_AdvancedMove = true;
var Maki = Maki || {};
Maki.AM = Maki.AM || {};

//=============================================================================
/*:
 * @plugindesc v1.02 Advanced Move Route
 * @author μ'ki
 *
 * @param Pathfinding Limit
 * @desc A* pathfinding search depth limit (0 = unlimited).
 * @default 12
 *
 * @param Pathfinding MTC
 * @desc Move/jump towards character using pathfinding (true/false).
 * @default true
 *
 * @param Player M/J Switch
 * @desc Switch ID to toggle player move(OFF)/jump(ON).
 * @default 1
 *
 * @param 8-directional Mode
 * @desc Allows player and events move in 8 directions (true/false).
 * @default false
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * μ'ki's Advanced Move Route is remake from my previous work, Alissa Advanced
 * Move Route (for RPG Maker XP & VX), for RPG Maker MV. It also overrides
 * the Move Toward Player route command to use pathfinding, like my another
 * previous work, Listra Pathfinder Module, does. However, here it uses the A*
 * pathfinding algorithm that already exists in the RPG MV game system, with
 * a little mod to adjust/omit the search limit.
 *
 * For information about Alissa Advanced Move Route, search the thread at
 * RPGMakerID forum (http://rmid.forumotion.net). Sorry, I don't know if it
 * exists, maybe because it has been several years ago.
 *
 * For information about Listra Pathfinder Module:
 * http://prodig.forumotion.net/t478-rgss-rgss2-listra-pathfinder-module
 *
 * Contact me for support/bug report:
 * listra92[at]gmail.com
 * https://www.facebook.com/don.listRA92
 *
 * ============================================================================
 * Features and Usages
 * ============================================================================
 *  - Adjusts A* pathfinding search depth limit (by default set to 12), if the
 *    shortest path to the destination is longer than that value, the character
 *    may stop in front of an obstacle.
 *  - Adjusts whether to use pathfinding for Move toward Player (and other
 *    characters) instead of naive movement that doesn't avoid obstacles.
 *  - Move towards point, just add script in the movement route:
 *    this.moveTowardPoint(X, Y);
 *  - Jump left(4), right(6), up(8), down(2) (one step, triggering Player/Event
 *    Touch): this.jumpStraight(direction[, turn_ok = true]);
 *  - Jump diagonally: this.jumpDiagonally(h, v[, turn_ok = true]);
 *  - Jump towards point (per step): this.jumpTowardPoint(X, Y);
 *  - Jump towards char (player/event): this.jumpTowardCharacter(character);
 *  - this.jumpTowardPlayer();
 *  - this.jumpAwayFromCharacter();
 *  - this.jumpRandom();
 *  - this.jumpForward();
 *  - this.jumpBackward();
 *  - this.eraseEvent(event);
 *  - Flow label: this.label(label_name);
 *  - Jump to label with condition: this.jumpLabel(label_name[, cond = "true"]);
 *  - this.endRoute();
 *
 * ============================================================================
 * Coming in the Next Version
 * ============================================================================
 *  - More movement route commands.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * v1.02:
 *  - Prepared for compatibility to MK_Pathfinding.js plugin.
 *
 * v1.01b:
 *  - 8-direction support for the pathfinding algorithm.
 *
 * v1.01:
 *  - Improved the A* algorithm that lagged when targeting a character, since
 *    it isn't passable and causes the algorithm search entire pathable tiles.
 *  - Fixed followers not moving when the player character is in jump mode.
 *  - 8-direction player movement.
 *
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

Maki.AM.Parameters = PluginManager.parameters('MK_AdvancedMove');

Maki.AM.DepthLimit = Number(Maki.AM.Parameters['Pathfinding Limit']);
Maki.AM.PMTC = !!eval(String(Maki.AM.Parameters['Pathfinding MTC']));
Maki.AM.MJS = Number(Maki.AM.Parameters['Player M/J Switch']);
Maki.AM.Dir8 = !!eval(String(Maki.AM.Parameters['8-directional Mode']));

//=============================================================================
// Game_Character
//=============================================================================

Game_Character.prototype.searchLimit = function() {
    return Maki.AM.DepthLimit;
};

Game_Character.prototype.findDirectionTo = function(goalX, goalY) {
    var searchLimit = this.searchLimit();
    var mapWidth = $gameMap.width();
    var nodeList = [];
    var openList = [];
    var closedList = [];
    var start = {};
    var best = start;

    if (this.x === goalX && this.y === goalY) {
        return 0;
    }

    start.parent = null;
    start.x = this.x;
    start.y = this.y;
    start.g = 0;
    start.f = $gameMap.distance(start.x, start.y, goalX, goalY);
    nodeList.push(start);
    openList.push(start.y * mapWidth + start.x);

    var SQ2 = Math.sqrt(2);
    while (nodeList.length > 0) {
        var bestIndex = 0;
        for (var i = 0; i < nodeList.length; i++) {
            if (nodeList[i].f < nodeList[bestIndex].f) {
                bestIndex = i;
            }
        }

        var current = nodeList[bestIndex];
        var x1 = current.x;
        var y1 = current.y;
        var pos1 = y1 * mapWidth + x1;
        var g1 = current.g;

        nodeList.splice(bestIndex, 1);
        openList.splice(openList.indexOf(pos1), 1);
        closedList.push(pos1);

        if (current.x === goalX && current.y === goalY) {
            best = current;
            goaled = true;
            break;
        }

        if (g1 >= searchLimit && searchLimit > 0) {
            continue;
        }

        for (var j = 1; j <= 9; j++) {
            var direction = j;
            if (direction === 5) continue;
            if (direction % 2 > 0 && !Maki.AM.Dir8) continue;
            var x2 = $gameMap.roundXWithDirection(x1, ((direction-1) % 3)+4);
            var y2 = $gameMap.roundYWithDirection(y1, Math.floor((direction-1)/3)*3+2);
            var pos2 = y2 * mapWidth + x2;
            if (closedList.contains(pos2)) {
                continue;
            }
            if (direction % 2 > 0 && Maki.AM.Dir8) {
                if (!this.canPassDiagonally(x1, y1,
                    (direction % 6)+3, Math.floor(direction/6)*6+2) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1.5) {
                    continue;
                }
            } else {
                if (!this.canPass(x1, y1, direction) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1) {
                    continue;
                }
            }

            var g2 = g1;
            if (direction % 2 > 0) {
                g2 += SQ2;
            } else {
                g2 += 1;
            }
            var index2 = openList.indexOf(pos2);

            if (index2 < 0 || g2 < nodeList[index2].g) {
                var neighbor;
                if (index2 >= 0) {
                    neighbor = nodeList[index2];
                } else {
                    neighbor = {};
                    nodeList.push(neighbor);
                    openList.push(pos2);
                }
                neighbor.parent = current;
                neighbor.x = x2;
                neighbor.y = y2;
                neighbor.g = g2;
                neighbor.f = g2 + $gameMap.distance(x2, y2, goalX, goalY);
                if (!best || neighbor.f - neighbor.g < best.f - best.g) {
                    best = neighbor;
                }
            }
        }
    }

    var node = best;
    while (node.parent && node.parent !== start) {
        node = node.parent;
    }

    var deltaX1 = $gameMap.deltaX(node.x, start.x);
    var deltaY1 = $gameMap.deltaY(node.y, start.y);
    if (deltaX1 !== 0) deltaX1 /= Math.abs(deltaX1);
    if (deltaY1 !== 0) deltaY1 /= Math.abs(deltaY1);
    return 5 - deltaY1 * 3 + deltaX1;
};

if(Maki.AM.PMTC){
Game_Character.prototype.moveTowardCharacter = function(character) {
    direction = this.findDirectionTo(character.x,character.y);
    if (direction % 2 > 0) {
        this.moveDiagonally((direction % 6)+3, Math.floor(direction/6)*6+2);
    } else {
        this.moveStraight(direction);
    }
};
}

Game_Character.prototype.moveTowardPoint = function(x, y) {
    this.moveStraight(this.findDirectionTo(x, y));
};

Game_Character.prototype.jumpStraight = function(d, turn_ok) {
    if (turn_ok === undefined) {
        turn_ok = true;
    }
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
        if (turn_ok) this.setDirection(d);
        this._x = $gameMap.roundXWithDirection(this._x, d);
        this._y = $gameMap.roundYWithDirection(this._y, d);
        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
        this._jumpPeak = 11 - this.realMoveSpeed();
        this._jumpCount = this._jumpPeak * 2 - (this._dashing ? 2 : 0);
        this.straighten();
        this.increaseSteps();
    } else {
        if (turn_ok) this.setDirection(d);
        this.checkEventTriggerTouchFront(d);
    }
    return this.isMovementSucceeded();
};

Game_Character.prototype.jumpDiagonally = function(h, v, turn_ok) {
    if (turn_ok === undefined) {
        turn_ok = true;
    }
    this.setMovementSuccess(this.canPassDiagonally(this._x, this._y, h, v));
    if (this.isMovementSucceeded()) {
        this._x = $gameMap.roundXWithDirection(this._x, h);
        this._y = $gameMap.roundYWithDirection(this._y, v);
        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(h));
        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(v));
        this._jumpPeak = 11 - this.realMoveSpeed();
        this._jumpCount = this._jumpPeak * 2 - (this._dashing ? 2 : 0);
        this.straighten();
        this.increaseSteps();
    }
    if (turn_ok) {
        if (this._direction === this.reverseDir(h)) this.setDirection(h);
        if (this._direction === this.reverseDir(v)) this.setDirection(v);
    }
    return this.isMovementSucceeded();
};

Game_Player.prototype.jumpStraight = function(d, turn_ok) {
    if (this.canPass(this.x, this.y, d)) {
        this._followers.updateMove();
    }
    Game_Character.prototype.jumpStraight.call(this, d, turn_ok);
};

Game_Player.prototype.jumpDiagonally = function(h, v, turn_ok) {
    if (this.canPassDiagonally(this.x, this.y, h, v)) {
        this._followers.updateMove();
    }
    Game_Character.prototype.jumpDiagonally.call(this, h, v, turn_ok);
};


Game_Character.prototype.jumpTowardPoint = function(x, y) {
    if (Maki.AM.PMTC){
        direction = this.findDirectionTo(x, y);
        if (direction % 2 > 0) {
            this.jumpDiagonally((direction % 6)+3, Math.floor(direction/6)*6+2);
        } else {
            this.jumpStraight(direction);
        }
    } else {
        var sx = this.deltaXFrom(x);
        var sy = this.deltaYFrom(y);
        if (Math.abs(sx) > Math.abs(sy)) {
            if (!this.jumpStraight(sx > 0 ? 4 : 6) && sy !== 0) {
                this.jumpStraight(sy > 0 ? 8 : 2);
            }
        } else if (sy !== 0) {
            if (!this.jumpStraight(sy > 0 ? 8 : 2, true) && sx !== 0) {
                this.jumpStraight(sx > 0 ? 4 : 6);
            }
        }
    }
};

Game_Character.prototype.jumpTowardCharacter = function(character) {
    this.jumpTowardPoint(character.x, character.y);
};

Game_Character.prototype.jumpAwayFromCharacter = function(character) {
    this.turnAwayFromCharacter(character);
    this.jumpStraight(this._direction);
};

Game_Character.prototype.jumpTowardPlayer = function() {
    this.jumpTowardCharacter($gamePlayer);
};

Game_Character.prototype.jumpRandom = function() {
    var dir = 2+2*Math.randomInt(4);
    this.jumpStraight(dir);
};

Game_Character.prototype.jumpForward = function() {
    this.jumpStraight(this._direction, false);
};

Game_Character.prototype.jumpBackward = function() {
    this.jumpStraight(this.reverseDir(this._direction), false);
};

Game_Character.prototype.eraseEvent = function(event) {
    if (event > 0) {
        $gameMap._events[event].erase();
    }
};

Game_Character.prototype.label = function(label_name) {
    this._moveRoute.list[this._moveRouteIndex].code = 46;
    this._moveRoute.list[this._moveRouteIndex].parameters[0] = label_name;
};

Game_Character.prototype.jumpLabel = function(label_name,cond) {
    if (cond === undefined) cond = "true";
    for (var i = 0; i < this._moveRoute.list.length; i++) {
        if (this._moveRoute.list[i].code == 46 &&
            this._moveRoute.list[i].parameters[0] == label_name) {
            if (eval(cond)) {
                this._moveRouteIndex = i;
                return;
            }
        }
    }
};

Game_Character.prototype.endRoute = function() {
    this._moveRoute.list[this._moveRouteIndex].code = 0;
    this._moveRouteIndex -= 1;
};

Game_Follower.prototype.chaseCharacter = function(character) {
    var sx = this.deltaXFrom(character.x);
    var sy = this.deltaYFrom(character.y);
    if (sx !== 0 && sy !== 0) {
        if ($gameSwitches.value(Maki.AM.MJS)) {
            this.jumpDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
        } else {
            this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
        }
    } else if (sx !== 0) {
        if ($gameSwitches.value(Maki.AM.MJS)) {
            this.jumpStraight(sx > 0 ? 4 : 6);
        } else {
            this.moveStraight(sx > 0 ? 4 : 6);
        }
    } else if (sy !== 0) {
        if ($gameSwitches.value(Maki.AM.MJS)) {
            this.jumpStraight(sy > 0 ? 8 : 2);
        } else {
            this.moveStraight(sy > 0 ? 8 : 2);
        }
    }
    this.setMoveSpeed($gamePlayer.realMoveSpeed());
};

Maki.AM.PlayerUpdateDashing = Game_Player.prototype.updateDashing;
Game_Player.prototype.updateDashing = function() {
    Maki.AM.PlayerUpdateDashing.call(this);
    thePlayer = this;
    this._followers.forEach(function(follower) {
        follower._dashing = thePlayer._dashing;
    }, this._followers);
};

Game_Player.prototype.getInputDirection = function() {
    if (Maki.AM.Dir8) {
        return Input.dir8;
    } else {
        return Input.dir4;
    }
};

Game_Player.prototype.executeMove = function(direction) {
    if (direction % 2 > 0) {
        if ($gameSwitches.value(Maki.AM.MJS)) {
            this.jumpDiagonally((direction % 6)+3, Math.floor(direction/6)*6+2);
        } else {
            this.moveDiagonally((direction % 6)+3, Math.floor(direction/6)*6+2);
        }
    } else {
        if ($gameSwitches.value(Maki.AM.MJS)) {
            this.jumpStraight(direction);
        } else {
            this.moveStraight(direction);
        }
    }
};
