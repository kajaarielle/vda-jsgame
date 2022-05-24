// https://photonstorm.github.io/phaser3-docs/

const timer = ms => new Promise(res => setTimeout(res, ms))

class Scene1 extends Phaser.Scene {
  constructor() {
    super({
      key: "scene1", active: true
    });
  }

  preload() {
    //#region LOAD RESOURCES
    this.load.image("tileSet", "images/tileset.png");
    this.load.image("tileSetSproutland", "images/tileset-sproutland.png");
    // this.load.tilemapTiledJSON("map", "source/tileMap.json");
    this.load.tilemapTiledJSONExternal('map', 'source/tilemap.json');

    this.load.spritesheet("player", "images/spritesheet-custom-2.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("npc", "images/spritesheet-custom-npc.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("chicken", "images/chicken.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.audio("music", ["audio/music.mp3"]);
    //#endregion

    //#region SET VARIABLES
    this.pixelSize = 16;
    this.mapTileSizeX = 32;
    this.mapTileSizeY = 16;
    this.debugMode = false;
    this.npcsTalkedTo = 0;
    this.dialogueOpen = false;
    //#endregion
  }

  create() {
    //#region PLAYER INPUT CONTROLLER
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keySpace.on("down", this.whenKeySpacePressed, this);

    this.controls = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    //#endregion

    this.generateSounds();
    const { tileMap, collisionLayers } = this.generateTilemap();
    this.player = this.generatePlayer();
    this.gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.player,
          walkingAnimationMapping: 0,
          startPosition: { x: 2, y: 5 },
          attackDMG: 2,
        },
      ],
    };

    //#region AI/NPC CHARACTERS
    this.generateNPC();
    this.generateChicken();

    this.gridEngine.create(tileMap, this.gridEngineConfig);

    this.makeSpecificCharacterArrays();
    this.characterMoveHandler();
    //#endregion

    //#region CAMERA
    this.cameras.main.setBounds(0, 0, (this.mapTileSizeX * this.pixelSize), (this.mapTileSizeY * this.pixelSize));
    this.cameras.main.startFollow(this.player);
    //#endregion

    //#region DEBUG MODE
    if (this.debugMode) {
      const debugGraphics = this.add.graphics().setAlpha(0.75);

      // Just debugging the layers with collision
      for (let i = 0; i < collisionLayers.length; i++) {
        collisionLayers[i].renderDebug(debugGraphics, {
          tileColor: null, // Color of non-colliding tiles
          collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
          faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
      }
    }
    //#endregion

    this.registry.set("playerHealth", this.player.maxHealth);
    this.registry.set("textUI", "closeUI");
    this.dialogueOpen = false;
  }

  generateSounds() {
    this.musicSound = this.sound.add("music", { loop: true, volume: 0.1 });
    this.musicSound.play();
  }

  generateTilemap() {
    const tileMap = this.make.tilemap({ key: "map" });
    // "name of tileset in Tiled", "name of phaser tileset reference"
    const tileset = tileMap.addTilesetImage("tileset", "tileSet");
    const tilesetSproutland = tileMap.addTilesetImage("tileset-sproutland", "tileSetSproutland");
    // layer names from Tiled ( tileset, x, y ) https://phaser.io/docs/2.4.4/Phaser.TilemapLayer.html
    const bgLayer = tileMap.createLayer("BG", [tileset, tilesetSproutland], 0, 0);
    const groundLayer = tileMap.createLayer("Ground", [tileset, tilesetSproutland], 0, 0);
    const worldLayer = tileMap.createLayer("World", [tileset, tilesetSproutland], 0, 0);
    const world2Layer = tileMap.createLayer("World2", [tileset, tilesetSproutland], 0, 0);
    const fenceLayer = tileMap.createLayer("Fence", [tileset, tilesetSproutland], 0, 0);
    const roofLayer = tileMap.createLayer("Roof", [tileset, tilesetSproutland], 0, 0);

    // Make array of collisionLayers to enable setCollisionByProperty and debug collision
    const collisionLayers = [worldLayer, fenceLayer];

    // GridEngine detects the "ge_collide" property automatically, but for debugMode, we need to set the property
    for (let i = 0; i < collisionLayers.length; i++) {
      collisionLayers[i].setCollisionByProperty({ ge_collide: true });
    }
    return { tileMap, collisionLayers };
  }

  generatePlayer() {
    let player = this.add.sprite(
      0, 0,
      "player"
    );
    this.physics.add.existing(player);

    player.healthMax = 100;
    player.healthCurrent = player.healthMax;
    player.strengthMax = 25;
    player.alive = true;

    player.attack = 3;
    return player;
  }

  characterMoveHandler() {
    this.npcArray.forEach(npc => {
      this.gridEngine.moveRandomly(npc.id, this.getRandomInt(0, 1500), 2);
    });
    this.chickenArray.forEach(chicken => {
      this.gridEngine.moveRandomly(chicken.id, this.getRandomInt(0, 1500));
    });
  }

  generateChicken() {
    for (let x = 11; x <= 13; x++) {
      for (let y = 15; y <= 18; y++) {
        const spr = this.add.sprite(0, 0, "chicken");
        this.physics.add.existing(spr);
        this.gridEngineConfig.characters.push({
          id: `chicken${x}#${y}`,
          sprite: spr,
          walkingAnimationMapping: 0,
          startPosition: { x, y },
          speed: 2,
        });
      }
    }
  }

  generateNPC() {
    const spr = this.add.sprite(0, 0, "npc");
    // spr.scale = 0.25;
    this.physics.add.existing(spr);

    this.gridEngineConfig.characters.push({
      id: `npc_1`,
      sprite: spr,
      walkingAnimationMapping: 0,
      startPosition: { x: 12, y: 4 },
      speed: 2,
    });
  }
  makeSpecificCharacterArrays() {
    this.npcArray = [];
    this.chickenArray = [];

    const characters = this.gridEngineConfig.characters;
    for (const character of characters) {
      if (character.id !== 'player') {
        if (character.id.includes("npc")) {
          this.npcArray.push(character);
        }
        else if (character.id.includes("chicken")) {
          this.chickenArray.push(character);
        }
      }
      else if (character.id == "player") {
        this.playerRef = character;
      }
    }
  }

  update() {
    this.playerMovementHandler();
  }

  playerMovementHandler() {
    if (this.controls.left.isDown) {
      this.gridEngine.move("player", "left");
    } else if (this.controls.right.isDown) {
      this.gridEngine.move("player", "right");
    } else if (this.controls.up.isDown) {
      this.gridEngine.move("player", "up");
    } else if (this.controls.down.isDown) {
      this.gridEngine.move("player", "down");
    }
  }

  whenKeySpacePressed() {
    let canTalk = false;

    if (!this.dialogueOpen) {
      for (let npc of this.npcArray) {
        this.currentNPC = npc;
        canTalk = this.checkRangeOverlap(1, this.currentNPC.id);
        if (canTalk) {
          this.gridEngine.stopMovement(this.currentNPC.id);
          this.registry.set("textUI", "openUI");
          this.dialogueOpen = true;
          break;
        }
      }
    }
    else {
      this.registry.set("textUI", "closeUI");
      this.dialogueOpen = false;
      this.gridEngine.moveRandomly(this.currentNPC.id, this.getRandomInt(0, 1500), 2);
    }
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  createPlayerAnimation(name, startFrame, endFrame) {
    this.anims.create({
      key: name,
      frames: this.anims.generateFrameNumbers("player", {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 6,
      repeat: 0,
      yoyo: true,
    });
  }

  checkRangeOverlap(range, character) {
    let rangeOverlap;
    let playerPos = this.gridEngine.getPosition("player");
    let characterPos = this.gridEngine.getPosition(character);
    let diffX = this.getDifference(characterPos.x, playerPos.x);
    let diffY = this.getDifference(characterPos.y, playerPos.y);

    if (diffX <= range && diffY <= range) {
      return rangeOverlap = true;
    }
    else {
      return rangeOverlap = false;
    }
  }

  getDifference(a, b) {
    return Math.abs(a - b);
  }
}
