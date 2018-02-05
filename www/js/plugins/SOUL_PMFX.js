// SOUL_PMFx.js by Soulpour777

/*:
* @plugindesc Apply Easing, Spring and Sine Jump in Showing Pictures!
* @author Soulpour777 - soulxregalia.wordpress.com
*
* @param -- EASING --
*
* @param Default Easing Value
* @desc The default Easing value of the easing effect. (changeable)
* @default 0.05
*
* @param -- SPRING --
*
* @param Default Spring Value
* @desc The default Spring value of the spring effect. (changeable)
* @default 0.03
*
* @param Default Friction Value
* @desc The default Friction value of the spring effect. (changeable)
* @default 0.95
*
* @param -- SINEJUMP --
*
* @param Minimum Distance
* @desc The additional x / y distance value when bobbing effect is executed.
* @default 50
*
* @param Maximum Distance
* @desc The additional x / y post-movement value when bobbing effect is executed.
* @default 80
*

@help

Picture Movement Effects (PMFx)
Author: Soulpour777

Instructions:

Place this plugin on the js / plugins folder. Make sure this is turned ON 
in order for it to work.

Plugin Commands:

=================================================
EASING EFFECT
=================================================
Picture : Easing : x

where x is either true or false. This determines if you want to
use the Easing Effect when you show a picture or not.

Picture : Set : Easing : Value

where Value is the new value of the easing speed / value when
you want to ease out the currently shown picture.

=================================================
SPRING EFFECT
=================================================

Picture : Spring : x
where x is either true or false. This determines if you want to
use the Spring Effect when you show a picture or not.

Picture : Set : Spring : Value

where Value is the new value of the spring speed / value when
you want to move the currently shown picture.

=================================================
SINE JUMP EFFECT
=================================================

Picture : SineJump : True / false
where x is either true or false. This determines if you want to
use the Sine Jump Effect when you show a picture or not.

Picture : Set : SineJump : X : eval

where eval is either true or false. This would mean that you
would use the sine jump horizontally. This would bob the
picture horizontally.

Picture : Set : SineJump : Y : eval

where eval is either true or false. This would mean that you
would use the sine jump vertically. This would bob the
picture vertically.

Note:

When one effect is used, other effects priorly used will 
not be activated. This is to avoid conflict between
desired effects and already active effects.

*/

var Imported = Imported || {};
Imported.SOUL_PMFX = true;

var Soulpour777 = Soulpour777 || {};
Soulpour777.SOUL_PMFX = Soulpour777.SOUL_PMFX || {};

var pmfx = PluginManager.parameters('SOUL_PMFX');

Soulpour777.SOUL_PMFX.defEasingValue = Number(pmfx['Default Easing Value']);
Soulpour777.SOUL_PMFX.defSpringValue = Number(pmfx['Default Spring Value']);
Soulpour777.SOUL_PMFX.defFrictionValue = Number(pmfx['Default Friction Value']);
Soulpour777.SOUL_PMFX.minDist = Number(pmfx['Minimum Distance']);
Soulpour777.SOUL_PMFX.maxDist = Number(pmfx['Minimum Distance']);

Soulpour777.SOUL_PMFX.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    Soulpour777.SOUL_PMFX.Game_System_initialize.call(this);
    // Easing
    this.isEasing = false;
    this.easingValue = Soulpour777.SOUL_PMFX.defEasingValue;

    // Spring and Friction
    this.isSpring = false;
    this.spring = Soulpour777.SOUL_PMFX.defSpringValue;
    this.friction = Soulpour777.SOUL_PMFX.defFrictionValue;
    this._vx = 0;
    this._vy = 0;

    // Sine Jump
    this.isSineJump = false;
    this.sineJumpStart = 0;
    this.sineJumpBobX = false;
    this.sineJumpBobY = false;
}
Soulpour777.SOUL_PMFX.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Soulpour777.SOUL_PMFX.Game_Interpreter_pluginCommand.call(this, command, args);
    switch(command) {
        case 'Picture':
            // Picture : Easing : True / false
            if (args[0] === ':' && args[1] === 'Easing') {
                $gameSystem.isEasing = eval(args[3]);
                if($gameSystem.isEasing) {
                    $gameSystem.isSpring = false;
                    $gameSystem.isSineJump = false;
                }
            }
            // Picture : Set : Easing : Value
            if (args[0] === ':' && args[1] === 'Set' && args[3] === 'Easing') {
                $gameSystem.easingValue = Number(args[5]);
            } 
            // Picture : Spring : True / false
            if (args[0] === ':' && args[1] === 'Spring') {
                $gameSystem.isSpring = eval(args[3]);
                if($gameSystem.isSpring) {
                    $gameSystem.isEasing = false;
                    $gameSystem.isSineJump = false;
                }                
            }    
            // Picture : Set : Spring : Value
            if (args[0] === ':' && args[1] === 'Set' && args[3] === 'Spring') {
                $gameSystem.spring = Number(args[5]);
            }         
            // Picture : SineJump : True / false
            if (args[0] === ':' && args[1] === 'SineJump') {
                $gameSystem.isSineJump = eval(args[3]);
                if($gameSystem.isSineJump) {
                    $gameSystem.isEasing = false;
                    $gameSystem.isSpring = false;
                }                  
            }        
            // Picture : Set : SineJump : X : true / false
            if (args[0] === ':' && args[1] === 'Set' && args[3] === 'SineJump' && args[5] === 'X') {
                $gameSystem.sineJumpBobX = eval(args[7]);
            }      
            // Picture : Set : SineJump : Y : true / false
            if (args[0] === ':' && args[1] === 'Set' && args[3] === 'SineJump' && args[5] === 'Y') {
                $gameSystem.sineJumpBobY = eval(args[7]);
            }                         
    }
};


// Game Picture is Modified
Game_Picture.prototype.updateMove = function() {
    if (this._duration > 0) {
        var d = this._duration;

        this._x = (this._x * (d - 1) + this._targetX) / d;
        this._y = (this._y * (d - 1) + this._targetY) / d;

        if ($gameSystem.isEasing) {
            var vx = (this._targetX - this._x) * $gameSystem.easingValue, vy = (this._targetY - this._y) * $gameSystem.easingValue;
            this._x += vx;
            this._y += vy;
        }

        if ($gameSystem.isSpring) {
            var dx = this._targetX - this._x, ax = dx * $gameSystem.spring;
            var dy = this._targetY - this._y, ay = dy * $gameSystem.spring;
            $gameSystem._vx += ax;
            $gameSystem._vx *= $gameSystem.friction;
            $gameSystem._vy += ay;
            $gameSystem._vy *= $gameSystem.friction;            
            this._x += $gameSystem._vx;
            this._y += $gameSystem._vy;
        }

        this._scaleX  = (this._scaleX  * (d - 1) + this._targetScaleX)  / d;
        this._scaleY  = (this._scaleY  * (d - 1) + this._targetScaleY)  / d;
        this._opacity = (this._opacity * (d - 1) + this._targetOpacity) / d;
        this._duration--;
    }
};

Soulpour777.SOUL_PMFX.Game_Picture_update = Game_Picture.prototype.update;
Game_Picture.prototype.update = function() {
    Soulpour777.SOUL_PMFX.Game_Picture_update.call(this);

    if ($gameSystem.isSineJump) {
        if ($gameSystem.sineJumpBobX) {
            this._x = Soulpour777.SOUL_PMFX.minDist * Math.sin( $gameSystem.sineJumpStart ) + Soulpour777.SOUL_PMFX.maxDist;
        }
        if ($gameSystem.sineJumpBobY) {
            this._y = Soulpour777.SOUL_PMFX.minDist * Math.sin( $gameSystem.sineJumpStart ) + Soulpour777.SOUL_PMFX.maxDist;
        }
        $gameSystem.sineJumpStart += 0.05;
    }

};