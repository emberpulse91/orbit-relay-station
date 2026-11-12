/**
 * The ten fixed Codex assets. No other image name may ever be referenced.
 */
export const bgGame = require('../../assets/bg_game.png');
export const logo = require('../../assets/logo.png');
export const iconHome = require('../../assets/icon_home.png');
export const iconPause = require('../../assets/icon_pause.png');
export const buttonRect = require('../../assets/button_rect.png');
export const buttonRound = require('../../assets/button_round.png');

export const sprite1 = require('../../assets/sprite_1.png');
export const sprite2 = require('../../assets/sprite_2.png');
export const sprite3 = require('../../assets/sprite_3.png');
export const sprite4 = require('../../assets/sprite_4.png');
export const sprite5 = require('../../assets/sprite_5.png');

/** sprite_1..sprite_4 are the deployable relay modules. */
export const moduleSprites = [sprite1, sprite2, sprite3, sprite4];
/** sprite_5 is the biggest rig in the set, so it plays the sector reactor. */
export const reactorSprite = sprite5;

export const assets = {
  bgGame,
  logo,
  iconHome,
  iconPause,
  buttonRect,
  buttonRound,
  sprite1,
  sprite2,
  sprite3,
  sprite4,
  sprite5,
};

export default assets;
