//=============================================================================
// μ'ki's Pathfinding v1.00
// MK_Pathfinding.js
//=============================================================================

var Imported = Imported || {};
Imported.MK_Pathfinding = true;
var Maki = Maki || {};
Maki.PF = Maki.PF || {};

//=============================================================================
/*:
 * @plugindesc v1.00 Pathfinding Extras
 * @author μ'ki
 *
 * @param Pathfinding Limit
 * @desc Pathfinding search depth limit (0 = unlimited).
 * @default 12
 *
 * @param Pathfinding Algorithm
 * @desc Pathfinding algorithm (0: A*, 1: Jump-point Search, 2: Dijkstra, 3: Greedy Best-first Search).
 * @default 1
 *
 * @param 8-directional Mode
 * @desc 8-directional mode for the pathfinding algorithm (true/false).
 * @default false
 *
 * @param Remember Path
 * @desc Keeps the found path until reaching the destination, can be obstructed by moving characters (true/false).
 * @default false
 *
 * @param Path Trace
 * @desc Display visualization of the path and explored tiles (true/false). Warning, at cost of the performance!
 * @default false
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * Unlike in RPG Maker VX Ace and former, RPG Maker MV's default game system
 * allows the player to click on a game map tile as destination. The player
 * character will find a shortest path to it using A* pathfinding algorithm, as
 * implemented in method Game_Character.findDirectionTo.
 *
 * In this plugin, such that method is overriden and extended to allow you to
 * select one of pathfinding algorithms: A*, Jump-point Search, Dijkstra and
 * Greedy Best-first Search. Additionally, you can also enable the characters
 * to move diagonally by setting the parameter '8-directional Mode'.
 * 
 * Contact me for support/bug report:
 * listra92[at]gmail.com
 *
 * ============================================================================
 * Features and Usages
 * ============================================================================
 *  - Option to select other pathfinding algorithms to experiment: Jump-point
 *    Search, Dijkstra and Greedy Best-first Search.
 *  - Option whether to keep the found path until the character reach the
 *    destination; thus the pathfinding algorithm is only executed once when
 *    being ordered to move to the destination. However, the path can be
 *    obstructed by some moving objects (other characters), as the character
 *    won't move avoiding them.
 *  - Option whether to draw diagnostic traces as magenta and blue squares
 *    that represent path and explored tiles.
 *
 * ============================================================================
 * Notes
 * ============================================================================
 *  - If you have MK_AdvancedMove plugin installed, put this plugin under it.
 *  - Jump-point search is the fastest algorithm since it searches fewer tiles
 *    than A* does, but still produces shortest path.
 *  - Greedy best-first search often performs badly; it tends to produce much
 *    longer path. Also unless the 'Remember Path' option is enabled, the
 *    character's movement can somewhat get stalled.
 *
 * ============================================================================
 * Coming in the Next Version
 * ============================================================================
 *  - Some optimizations, probably.
 *
 * ============================================================================
 * Known issues
 * ============================================================================
 *  - The current implemented jump-point search somewhat fails on dealing with
 *    some certain tiles, like in sample map 'School Hall'.
 *
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

Maki.PF.Parameters = PluginManager.parameters('MK_Pathfinding');

Maki.PF.DepthLimit = Number(Maki.PF.Parameters['Pathfinding Limit']);
Maki.PF.Algo = Number(Maki.PF.Parameters['Pathfinding Algorithm']);
Maki.PF.Dir8 = !!eval(String(Maki.PF.Parameters['8-directional Mode']));
Maki.PF.PathTrace = !!eval(String(Maki.PF.Parameters['Path Trace']));
Maki.PF.MemPath = !!eval(String(Maki.PF.Parameters['Remember Path']));
Maki.PF.SQRT2 = Math.sqrt(2);

Game_Map.prototype.distance = function(x1, y1, x2, y2) {
    var deltaX = Math.abs(this.deltaX(x1, x2));
    var deltaY = Math.abs(this.deltaY(y1, y2));
    if (Maki.PF.Dir8) {
        return Math.min(deltaX, deltaY) * Maki.PF.SQRT2 + Math.abs(deltaX - deltaY);
    } else {
        return deltaX + deltaY;
    }
};

Maki.PF.GameCharacterBaseInitMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
    Maki.PF.GameCharacterBaseInitMembers.call(this);
    this._path = [];
    this._explored = [];
    this._pathl = 0;
    this._exploredl = 0;
};

//-----------------------------------------------------------------------------
// Sprite_Trace
//-----------------------------------------------------------------------------

function Sprite_Trace() {
    this.initialize.apply(this, arguments);
}

Sprite_Trace.prototype = Object.create(Sprite.prototype);
Sprite_Trace.prototype.constructor = Sprite_Trace;

Sprite_Trace.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.createBitmap();
    this._frameCount = 0;
    this.ispath = 0;
};

Sprite_Trace.prototype.update = function() {
    if ($gameTemp.isDestinationValid() && this.idx < $gamePlayer._exploredl +
        ($gamePlayer._pathl - $gamePlayer._exploredl) * this.ispath){
        this.updatePosition();
        this.updateAnimation();
        this.visible = true;
    } else {
        this._frameCount = 0;
        this.visible = false;
    }
};

Sprite_Trace.prototype.createBitmap = function() {
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    this.bitmap = new Bitmap(tileWidth, tileHeight);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.blendMode = Graphics.BLEND_ADD;
};

Sprite_Trace.prototype.updatePosition = function() {
    if ($gameTemp.isDestinationValid() && this.idx < $gamePlayer._exploredl +
        ($gamePlayer._pathl - $gamePlayer._exploredl) * this.ispath){
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    if (this.ispath) {
        var x = $gamePlayer._path[this.idx] % $gameMap.width();
        var y = Math.floor($gamePlayer._path[this.idx] / $gameMap.width());
    } else {
        var x = $gamePlayer._explored[this.idx] % $gameMap.width();
        var y = Math.floor($gamePlayer._explored[this.idx] / $gameMap.width());
    }
    this.x = ($gameMap.adjustX(x) + 0.5) * tileWidth;
    this.y = ($gameMap.adjustY(y) + 0.5) * tileHeight;
    }
};

Sprite_Trace.prototype.updateAnimation = function() {
    /*this._frameCount++;
    this._frameCount %= 20;
    this.opacity = 120 + (20 - this._frameCount) * 6;
    this.scale.x = 1 + this._frameCount / 20;
    this.scale.y = this.scale.x;*/
};

Maki.PF.SpritesetMapCreateDestination = Spriteset_Map.prototype.createDestination;
Spriteset_Map.prototype.createDestination = function() {
    Maki.PF.SpritesetMapCreateDestination.call(this);
    if (Maki.PF.PathTrace){
    this._traceSprite = [];
    this._traceSprite2 = [];
    for (var i = 0; i < 256; i++) {
        this._traceSprite.push(new Sprite_Trace());
        this._traceSprite[i].idx = i;
        this._traceSprite[i].ispath = 1;
        this._traceSprite[i].z = 9;
        this._traceSprite[i].bitmap.fillRect(0, 0,
            $gameMap.tileWidth(), $gameMap.tileHeight(), 'red');
        this._tilemap.addChild(this._traceSprite[i]);
    }
    for (var i = 0; i < 512; i++) {
        this._traceSprite2.push(new Sprite_Trace());
        this._traceSprite2[i].idx = i;
        this._traceSprite2[i].ispath = 0;
        this._traceSprite2[i].z = 9;
        this._traceSprite2[i].bitmap.fillRect(0, 0,
            $gameMap.tileWidth(), $gameMap.tileHeight(), 'blue');
        this._tilemap.addChild(this._traceSprite2[i]);
    }
    }
};

if (!Imported.MK_AdvancedMove) {
    Game_Player.prototype.executeMove = function(direction) {
        if (direction % 2 > 0) {
            this.moveDiagonally((direction % 6)+3, Math.floor(direction/6)*6+2);
        } else {
            this.moveStraight(direction);
        }
    };
}

if (Maki.PF.MemPath) {
Game_Player.prototype.moveByInput = function() {
    if (!this.isMoving() && this.canMove()) {
        var direction = this.getInputDirection();
        if (direction > 0) {
            $gameTemp.clearDestination();
            this._path = [];
            this._explored = [];
            this._pathl = 0;
            this._exploredl = 0;
        } else if ($gameTemp.isDestinationValid()){
            if (!this._pathl && $gameTemp.isDestinationValid()){
                var x = $gameTemp.destinationX();
                var y = $gameTemp.destinationY();
                direction = this.findDirectionTo(x, y);
            }
            var deltaX1 = $gameMap.deltaX(
            this._path[this._pathl-1] % $gameMap.width(), this.x);
            var deltaY1 = $gameMap.deltaY(
            Math.floor(this._path[this._pathl-1]/$gameMap.width()), this.y);
            if (1 >= Math.abs(deltaX1) && 1 >= Math.abs(deltaY1)) this._pathl--;
            if (this._pathl + 1) {
                if (deltaX1 !== 0) deltaX1 /= Math.abs(deltaX1);
                if (deltaY1 !== 0) deltaY1 /= Math.abs(deltaY1);
                direction = 5 - deltaY1 * 3 + deltaX1;
            }
        }
        if (direction > 0) {
            this.executeMove(direction);
        }
    }
};
}

//=============================================================================
// Game_Character
//=============================================================================

Game_Character.prototype.searchLimit = function() {
    return Maki.PF.DepthLimit;
};

Game_Character.prototype.findDirectionTo = function(goalX, goalY) {
    if (Maki.PF.Algo === 0) {
        return Maki.PF.Pathfinding_AStar(this, goalX, goalY);
    } else if (Maki.PF.Algo === 1) {
        return Maki.PF.Pathfinding_JPS(this, goalX, goalY);
    } else if (Maki.PF.Algo === 2) {
        return Maki.PF.Pathfinding_Dijkstra(this, goalX, goalY);
    } else if (Maki.PF.Algo === 3) {
        return Maki.PF.Pathfinding_GBFS(this, goalX, goalY);
    }
};

Maki.PF.Pathfinding_AStar = function(character, goalX, goalY) {
    var searchLimit = character.searchLimit();
    var mapWidth = $gameMap.width();
    var nodeList = [];
    var openList = [];
    var closedList = [];
    var start = {};
    var best = start;

    if (character.x === goalX && character.y === goalY) {
        return 0;
    }

    start.parent = null;
    start.x = character.x;
    start.y = character.y;
    start.g = 0;
    start.f = $gameMap.distance(start.x, start.y, goalX, goalY);
    nodeList.push(start);
    openList.push(start.y * mapWidth + start.x);

    if (Maki.PF.PathTrace || Maki.PF.MemPath) {
        character._pathl = 0;
        character._path = [];
        character._exploredl = 0;
        character._explored = [];
    }
    while (nodeList.length > 0) {
        var bestIndex = 0;
        var l = nodeList.length;
        for (var i = 0; i < l; i++) {
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
        if (Maki.PF.PathTrace && character._exploredl < 512) {
            character._explored.push(pos1);
            character._exploredl++;
        }

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
            if (direction % 2 > 0 && !Maki.PF.Dir8) continue;
            var x2 = $gameMap.roundXWithDirection(x1, ((direction-1) % 3)+4);
            var y2 = $gameMap.roundYWithDirection(y1, Math.floor((direction-1)/3)*3+2);
            var pos2 = y2 * mapWidth + x2;
            if (closedList.contains(pos2)) {
                continue;
            }
            if (direction % 2 > 0 && Maki.PF.Dir8) {
                if (!character.canPassDiagonally(x1, y1,
                    (direction % 6)+3, Math.floor(direction/6)*6+2) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1.5) {
                    continue;
                }
            } else {
                if (!character.canPass(x1, y1, direction) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1) {
                    continue;
                }
            }

            var g2 = g1;
            if (direction % 2 > 0) {
                g2 += Maki.PF.SQRT2;
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
        if ((Maki.PF.PathTrace || Maki.PF.MemPath) && character._pathl < 256 &&
            character.isDestinationValid()) {
            character._path.push(node.y * mapWidth + node.x);
            character._pathl++;
        }
        node = node.parent;
    }
    if ((Maki.PF.PathTrace || Maki.PF.MemPath) && character._pathl < 256) {
        character._path.push(node.y * mapWidth + node.x);
        character._pathl++;
    }

    var deltaX1 = $gameMap.deltaX(node.x, start.x);
    var deltaY1 = $gameMap.deltaY(node.y, start.y);
    if (deltaX1 !== 0) deltaX1 /= Math.abs(deltaX1);
    if (deltaY1 !== 0) deltaY1 /= Math.abs(deltaY1);
    if (deltaX1 === 0 && deltaY1 === 0) return 0;
    return 5 - deltaY1 * 3 + deltaX1;
};

Maki.PF.Pathfinding_JPS_scanh = function(character, current, goalX, goalY, hdir, recur) {
    var nodeList = [];
    var snodeList = [];
    var x0 = current.x;
    var y0 = current.y;
    var x1 = x0;
    var y1 = y0;
    while (true) {
        if (!character.canPass(x0, y0, 5+hdir) &&
            $gameMap.distance(x0, y0, goalX, goalY) > 1.3) {
            return [];
        }
        x1 = x0+hdir;
        var node = {};
        node.x = x1;
        node.y = y1;
        node.dirs = [];
        node.parent = current;
        node.g = node.parent.g+(x1-current.x)*hdir;
        node.f = node.g+$gameMap.distance(x1, y1, goalX, goalY);
        if (x1 === goalX && y1 === goalY) {
            return [node];
        }
        node.dirs = [5+hdir];
        if (Maki.PF.Dir8) {
        if (!character.canPass(x1, y1, 2) &&
            character.canPassDiagonally(x1, y1, 5+hdir, 2) &&
            $gameMap.distance(x1, y1, goalX, goalY) > 1.3) {
            node.dirs.push(2+hdir);
        }
        if (!character.canPass(x1, y1, 8) &&
            character.canPassDiagonally(x1, y1, 5+hdir, 8) &&
            $gameMap.distance(x1, y1, goalX, goalY) > 1.3) {
            node.dirs.push(8+hdir);
        }
        if (!character.canPass(x1, y1, 2) &&
            1.3 > $gameMap.distance(x1, y1, goalX, goalY)) {
            node.dirs.push(2);
        }
        if (!character.canPass(x1, y1, 8) &&
            1.3 > $gameMap.distance(x1, y1, goalX, goalY)) {
            node.dirs.push(8);
        }
        } else {
        if (!character.canPass(x0, y1, 2) &&
            character.canPass(x1, y1, 2) &&
            $gameMap.distance(x0, y1, goalX, goalY) > 1.3) {
            node.dirs.push(2);
        }
        if (!character.canPass(x0, y1, 8) &&
            character.canPass(x1, y1, 8) &&
            $gameMap.distance(x0, y1, goalX, goalY) > 1.3) {
            node.dirs.push(8);
        }
        }
        if (!recur && node.dirs.length > 1) {
            return [node];
        }
        if (recur) {
        nodeList = [node];
        var done1 = 0;
        var done2 = 0;
        if (node.dirs.length === 1 && nodeList.length === 1) {
            done1 = 1;
            snodeList = Maki.PF.Pathfinding_JPS_scanv(character, node, goalX, goalY, 1);
            if (snodeList.length > 0) {
                nodeList.push(snodeList[0]);
            }
        }
        if (node.dirs.length === 1 && nodeList.length === 1) {
            done2 = 1;
            snodeList = Maki.PF.Pathfinding_JPS_scanv(character, node, goalX, goalY, -1);
            if (snodeList.length > 0) {
                nodeList.push(snodeList[0]);
            }
        }
        if (node.dirs.length*nodeList.length > 1) {
            if (node.dirs.length === 1 && done1 === 0) {
                node.dirs.push(2);
            }
            if (node.dirs.length === 1 && done2 === 0) {
                node.dirs.push(8);
            }
            return nodeList;
        }
        }
        x0 = x1;
    }
};

Maki.PF.Pathfinding_JPS_scanv = function(character, current, goalX, goalY, vdir, recur) {
    var nodeList = [];
    var snodeList = [];
    var x0 = current.x;
    var y0 = current.y;
    var x1 = x0;
    var y1 = y0;
    while (true) {
        if (!character.canPass(x0, y0, 5-3*vdir) &&
            $gameMap.distance(x0, y0, goalX, goalY) > 1.3) {
            return [];
        }
        y1 = y0+vdir;
        var node = {};
        node.x = x1;
        node.y = y1;
        node.dirs = [];
        node.parent = current;
        node.g = current.g+(y1-current.y)*vdir;
        node.f = node.g+$gameMap.distance(x1, y1, goalX, goalY);
        if (x1 === goalX && y1 === goalY) {
            return [node];
        }
        node.dirs = [5-3*vdir];
        if (Maki.PF.Dir8) {
        if (!character.canPass(x1, y1, 6) &&
            character.canPassDiagonally(x1, y1, 6, 5-3*vdir) &&
            $gameMap.distance(x1, y1, goalX, goalY) > 1.3) {
            node.dirs.push(6-3*vdir);
        }
        if (!character.canPass(x1, y1, 4) &&
            character.canPassDiagonally(x1, y1, 4, 5-3*vdir) &&
            $gameMap.distance(x1, y1, goalX, goalY) > 1.3) {
            node.dirs.push(4-3*vdir);
        }
        if (!character.canPass(x1, y1, 6) &&
            1.3 > $gameMap.distance(x1, y1, goalX, goalY)) {
            node.dirs.push(6);
        }
        if (!character.canPass(x1, y1, 4) &&
            1.3 > $gameMap.distance(x1, y1, goalX, goalY)) {
            node.dirs.push(4);
        }
        } else {
        if (!character.canPass(x1, y0, 6) &&
            character.canPass(x1, y1, 6) &&
            $gameMap.distance(x1, y0, goalX, goalY) > 1.3) {
            node.dirs.push(6);
        }
        if (!character.canPass(x1, y0, 4) &&
            character.canPass(x1, y1, 4) &&
            $gameMap.distance(x1, y0, goalX, goalY) > 1.3) {
            node.dirs.push(4);
        }
        }
        if (!recur && node.dirs.length > 1) {
            return [node];
        }
        if (recur) {
        nodeList = [node];
        var done1 = 0;
        var done2 = 0;
        if (node.dirs.length === 1 && nodeList.length === 1) {
            done1 = 1;
            snodeList = Maki.PF.Pathfinding_JPS_scanh(character, node, goalX, goalY, 1);
            if (snodeList.length > 0) {
                nodeList.push(snodeList[0]);
            }
        }
        if (node.dirs.length === 1 && nodeList.length === 1) {
            done2 = 1;
            snodeList = Maki.PF.Pathfinding_JPS_scanh(character, node, goalX, goalY, -1);
            if (snodeList.length > 0) {
                nodeList.push(snodeList[0]);
            }
        }
        if (node.dirs.length*nodeList.length > 1) {
            if (node.dirs.length === 1 && done1 === 0) {
                node.dirs.push(6);
            }
            if (node.dirs.length === 1 && done2 === 0) {
                node.dirs.push(4);
            }
            return nodeList;
        }
        }
        y0 = y1;
    }
};

Maki.PF.Pathfinding_JPS_scand = function(character, current, goalX, goalY, hdir, vdir) {
    var nodeList = [];
    var snodeList = [];
    var x0 = current.x;
    var y0 = current.y;
    var x1 = x0;
    var y1 = y0;
    while (true) {
        if (!character.canPassDiagonally(x0, y0, 5+hdir, 5-3*vdir) &&
            $gameMap.distance(x0, y0, goalX, goalY) > 1.3) {
            return [];
        }
        x1 = x0+hdir;
        y1 = y0+vdir;
        var node = {};
        node.x = x1;
        node.y = y1;
        node.dirs = [];
        node.parent = current;
        node.g = current.g+(x1-current.x)*hdir*Maki.PF.SQRT2;
        node.f = node.g+$gameMap.distance(x1, y1, goalX, goalY);
        if (x1 === goalX && y1 === goalY) {
            return [node];
        }
        node.dirs = [5+hdir-3*vdir];
        if (!character.canPass(x1, y1, 5-hdir) &&
            character.canPassDiagonally(x1, y1, 5-hdir, 5-3*vdir) &&
            $gameMap.distance(x1, y1, goalX, goalY) > 1.3) {
            node.dirs.push(5-hdir-3*vdir);
        }
        if (!character.canPass(x1, y1, 5+3*vdir) &&
            character.canPassDiagonally(x1, y1, 5+hdir, 5+3*vdir) &&
            $gameMap.distance(x1, y1, goalX, goalY) > 1.3) {
            node.dirs.push(5+hdir+3*vdir);
        }
        nodeList = [node];
        var hor_done = 0;
        var vert_done = 0;
        if (node.dirs.length === 1 && nodeList.length === 1) {
            hor_done = 1;
            snodeList = Maki.PF.Pathfinding_JPS_scanh(character, node, goalX, goalY, hdir);
            if (snodeList.length > 0) {
                nodeList.push(snodeList[0]);
            }
        }
        if (node.dirs.length === 1 && nodeList.length === 1) {
            vert_done = 1;
            snodeList = Maki.PF.Pathfinding_JPS_scanv(character, node, goalX, goalY, vdir);
            if (snodeList.length > 0) {
                nodeList.push(snodeList[0]);
            }
        }
        if (node.dirs.length*nodeList.length > 1) {
            if (hor_done === 0) {
                node.dirs.push(5+hdir);
            }
            if (vert_done === 0) {
                node.dirs.push(5-3*vdir);
            }
            return nodeList;
        }
        x0 = x1;
        y0 = y1;
    }
};

Maki.PF.Pathfinding_JPS = function(character, goalX, goalY) {
    var searchLimit = character.searchLimit();
    var mapWidth = $gameMap.width();
    var nodeList = [];
    var openList = [];
    var closedList = [];
    var start = {};
    var best = start;

    if (character.x === goalX && character.y === goalY) {
        return 0;
    }

    start.parent = null;
    start.x = character.x;
    start.y = character.y;
    start.g = 0;
    start.f = $gameMap.distance(start.x, start.y, goalX, goalY);
    if (Maki.PF.Dir8) {
        start.dirs = [1, 2, 3, 4, 6, 7, 8, 9];
    } else {
        start.dirs = [2, 4, 6, 8];
    }
    nodeList.push(start);
    openList.push(start.y * mapWidth + start.x);

    if (Maki.PF.PathTrace || Maki.PF.MemPath) {
        character._pathl = 0;
        character._path = [];
        character._exploredl = 0;
        character._explored = [];
    }
    while (nodeList.length > 0) {
        var bestIndex = 0;
        var l = nodeList.length;
        for (var i = 0; i < l; i++) {
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
        if (Maki.PF.PathTrace && character._exploredl < 512) {
            character._explored.push(pos1);
            character._exploredl++;
        }

        if (current.x === goalX && current.y === goalY) {
            best = current;
            goaled = true;
            break;
        }

        if (g1 >= searchLimit && searchLimit > 0) {
            continue;
        }
        var nodes = [];
        var l = current.dirs.length;
        for (var i = 0; i < l; i++) {
            var direction = current.dirs[i];
            if (direction === 5) continue;
            if (direction % 2 > 0 && !Maki.PF.Dir8) continue;
            if (direction % 2 > 0 && Maki.PF.Dir8) {
                if (!character.canPassDiagonally(x1, y1,
                    (direction % 6)+3, Math.floor(direction/6)*6+2) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1.3) {
                    continue;
                }
                nodes = Maki.PF.Pathfinding_JPS_scand(character, current, goalX, goalY,
                    ((direction-1) % 3)-1, 1-Math.floor((direction-1)/3));
            } else {
                if (!character.canPass(x1, y1, direction) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1.3) {
                    continue;
                }
                if (((direction-1) % 3)-1 === 0) {
                    nodes = Maki.PF.Pathfinding_JPS_scanv(character, current,
                        goalX, goalY, 1-Math.floor((direction-1)/3), !Maki.PF.Dir8);
                } else {
                    nodes = Maki.PF.Pathfinding_JPS_scanh(character, current,
                        goalX, goalY, ((direction-1) % 3)-1, !Maki.PF.Dir8);
                }
            }
            var ll = nodes.length;
            for (var j = 0; j < ll; j++) {
                var pos2 = nodes[j].y * mapWidth + nodes[j].x;
                if (closedList.contains(pos2)) continue;
                var index2 = openList.indexOf(pos2);
                if (index2 < 0 || nodes[j].g < nodeList[index2].g) {
                    if (index2 >= 0) {
                        nodeList[index2] = nodes[j];
                    } else {
                        openList.push(pos2);
                        nodeList.push(nodes[j]);
                    }
                    if (!best || nodes[j].f - nodes[j].g < best.f - best.g) {
                        best = nodes[j];
                    }
                }
            }
        }
    }

    var node = best;
    while (node.parent && node.parent !== start) {
        if ((Maki.PF.PathTrace || Maki.PF.MemPath) && character._pathl < 256) {
            character._path.push(node.y * mapWidth + node.x);
            character._pathl++;
        }
        node = node.parent;
    }
    if ((Maki.PF.PathTrace || Maki.PF.MemPath) && character._pathl < 256) {
        character._path.push(node.y * mapWidth + node.x);
        character._pathl++;
    }

    var deltaX1 = $gameMap.deltaX(node.x, start.x);
    var deltaY1 = $gameMap.deltaY(node.y, start.y);
    if (deltaX1 !== 0) deltaX1 /= Math.abs(deltaX1);
    if (deltaY1 !== 0) deltaY1 /= Math.abs(deltaY1);
    if (deltaX1 === 0 && deltaY1 === 0) return 0;
    return 5 - deltaY1 * 3 + deltaX1;
};

Maki.PF.Pathfinding_Dijkstra = function(character, goalX, goalY) {
    var searchLimit = character.searchLimit();
    var mapWidth = $gameMap.width();
    var nodeList = [];
    var openList = [];
    var closedList = [];
    var start = {};
    var best = start;

    if (character.x === goalX && character.y === goalY) {
        return 0;
    }

    start.parent = null;
    start.x = character.x;
    start.y = character.y;
    start.g = 0;
    nodeList.push(start);
    openList.push(start.y * mapWidth + start.x);

    if (Maki.PF.PathTrace || Maki.PF.MemPath) {
        character._pathl = 0;
        character._path = [];
        character._exploredl = 0;
        character._explored = [];
    }
    while (nodeList.length > 0) {
        var bestIndex = 0;
        var l = nodeList.length;
        for (var i = 0; i < l; i++) {
            if (nodeList[i].g < nodeList[bestIndex].g) {
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
        if (Maki.PF.PathTrace && character._exploredl < 512) {
            character._explored.push(pos1);
            character._exploredl++;
        }

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
            if (direction % 2 > 0 && !Maki.PF.Dir8) continue;
            var x2 = $gameMap.roundXWithDirection(x1, ((direction-1) % 3)+4);
            var y2 = $gameMap.roundYWithDirection(y1, Math.floor((direction-1)/3)*3+2);
            var pos2 = y2 * mapWidth + x2;
            if (closedList.contains(pos2)) {
                continue;
            }
            if (direction % 2 > 0 && Maki.PF.Dir8) {
                if (!character.canPassDiagonally(x1, y1,
                    (direction % 6)+3, Math.floor(direction/6)*6+2) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1.5) {
                    continue;
                }
            } else {
                if (!character.canPass(x1, y1, direction) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1) {
                    continue;
                }
            }

            var g2 = g1;
            if (direction % 2 > 0) {
                g2 += Maki.PF.SQRT2;
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
            }
        }
    }

    var node = best;
    while (node.parent && node.parent !== start) {
        if ((Maki.PF.PathTrace || Maki.PF.MemPath) && character._pathl < 256) {
            character._path.push(node.y * mapWidth + node.x);
            character._pathl++;
        }
        node = node.parent;
    }
    if ((Maki.PF.PathTrace || Maki.PF.MemPath) && character._pathl < 256) {
        character._path.push(node.y * mapWidth + node.x);
        character._pathl++;
    }

    var deltaX1 = $gameMap.deltaX(node.x, start.x);
    var deltaY1 = $gameMap.deltaY(node.y, start.y);
    if (deltaX1 !== 0) deltaX1 /= Math.abs(deltaX1);
    if (deltaY1 !== 0) deltaY1 /= Math.abs(deltaY1);
    if (deltaX1 === 0 && deltaY1 === 0) return 0;
    return 5 - deltaY1 * 3 + deltaX1;
};

Maki.PF.Pathfinding_GBFS = function(character, goalX, goalY) {
    var searchLimit = character.searchLimit();
    var mapWidth = $gameMap.width();
    var closedList = [];
    var start = {};
    var best;

    if (character.x === goalX && character.y === goalY) {
        return 0;
    }

    start.parent = null;
    start.x = character.x;
    start.y = character.y;
    start.h = $gameMap.distance(start.x, start.y, goalX, goalY);
    var current = start;
    var g = 0;

    if (Maki.PF.PathTrace || Maki.PF.MemPath) {
        $gameTemp._pathl = 0;
        $gameTemp._path = [];
        $gameTemp._exploredl = 0;
        $gameTemp._explored = [];
    }
    while (g < (searchLimit || 2048)) {
        g++;
        var x1 = current.x;
        var y1 = current.y;
        var pos1 = y1 * mapWidth + x1;

        closedList.push(pos1);
        if (Maki.PF.PathTrace && character._exploredl < 512) {
            character._explored.push(pos1);
            character._exploredl++;
        }

        if (current.x === goalX && current.y === goalY) {
            goaled = true;
            break;
        }

        best = 0;
        for (var j = 1; j <= 9; j++) {
            var direction = j;
            if (direction === 5) continue;
            if (direction % 2 > 0 && !Maki.PF.Dir8) continue;
            var x2 = $gameMap.roundXWithDirection(x1, ((direction-1) % 3)+4);
            var y2 = $gameMap.roundYWithDirection(y1, Math.floor((direction-1)/3)*3+2);
            var pos2 = y2 * mapWidth + x2;
            if (closedList.contains(pos2)) {
                continue;
            }
            if (direction % 2 > 0 && Maki.PF.Dir8) {
                if (!character.canPassDiagonally(x1, y1,
                    (direction % 6)+3, Math.floor(direction/6)*6+2) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1.5) {
                    continue;
                }
            } else {
                if (!character.canPass(x1, y1, direction) &&
                    $gameMap.distance(x1, y1, goalX, goalY) > 1) {
                    continue;
                }
            }

                var neighbor = {};
                neighbor.parent = current;
                neighbor.x = x2;
                neighbor.y = y2;
                neighbor.h = $gameMap.distance(x2, y2, goalX, goalY);
                if (!best || neighbor.h < best.h) {
                    best = neighbor;
                }
        }
        current = best;
    }

    var node = best;
    while (node.parent && node.parent !== start) {
        if ((Maki.PF.PathTrace || Maki.PF.MemPath) && character._pathl < 256) {
            character._path.push(node.y * mapWidth + node.x);
            character._pathl++;
        }
        node = node.parent;
    }
    if ((Maki.PF.PathTrace || Maki.PF.MemPath) && character._pathl < 256) {
        character._path.push(node.y * mapWidth + node.x);
        character._pathl++;
    }

    var deltaX1 = $gameMap.deltaX(node.x, start.x);
    var deltaY1 = $gameMap.deltaY(node.y, start.y);
    if (deltaX1 !== 0) deltaX1 /= Math.abs(deltaX1);
    if (deltaY1 !== 0) deltaY1 /= Math.abs(deltaY1);
    if (deltaX1 === 0 && deltaY1 === 0) return 0;
    return 5 - deltaY1 * 3 + deltaX1;
};