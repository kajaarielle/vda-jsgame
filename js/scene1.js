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
    // this.load.audio("attack", ["audio/attack.mp3"]);
    // this.load.audio("walk", ["audio/walk.mp3"]);
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
    // this.generateEnemy();

    this.gridEngine.create(tileMap, this.gridEngineConfig);

    this.makeSpecificCharacterArrays();
    this.characterMoveHandler();
    //#endregion

    //#region CAMERA
    this.cameras.main.setBounds(0, 0, (this.mapTileSizeX * this.pixelSize), (this.mapTileSizeY * this.pixelSize));
    this.cameras.main.startFollow(this.player);
    //#endregion

    //#region UI
    // this.playerTurnsUI = this.add.text(0, 0, 'Player turns: ' + this.playerTurns).setScrollFactor(0);
    // this.healthUI = this.add.text(0, 24, 'HEALTH:' + this.player.healthMax).setScrollFactor(0);
    // this.attackUI = this.add.text(0, 54, 'ATTACK').setScrollFactor(0);
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
    // this.attackSound = this.sound.add("attack", { loop: false });
    // this.walkSound = this.sound.add("walk", { loop: false, volume: 0.5 });
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


    // for (let x = 4; x <= 7; x++) {
    //   for (let y = 5; y <= 8; y++) {
    //     const spr = this.add.sprite(0, 0, "charactersheet");
    //     spr.scale = 0.25;
    //     this.physics.add.existing(spr);
    //     this.gridEngineConfig.characters.push({
    //       id: `npc${x}#${y}`,
    //       sprite: spr,
    //       walkingAnimationMapping: this.getRandomInt(0, 6),
    //       startPosition: { x, y },
    //       speed: 2,
    //     });
    //   }
    // }
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
    console.log("SPACE!");

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

  //#region CUSTOM FUNCTIONS

  //   generateCollectables () {

  //     this.collectables = this.game.add.group();
  //     this.collectables.enableBody = true;
  //     this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

  //     var amount = 100;
  //     for (var i = 0; i < amount; i++) {
  //         var point = this.getRandomLocation();
  //         this.generateChest(point);
  //     }
  // }

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
  // createEnemyAnimation(character, name, startFrame, endFrame) {
  //   this.anims.create({
  //     key: name,
  //     frames: this.anims.generateFrameNumbers(character, {
  //       start: startFrame,
  //       end: endFrame,
  //     }),
  //     frameRate: 6,
  //     repeat: 0,
  //     yoyo: true,
  //   });
  // }

  // //#region CONTROLLER FUNCTIONS
  // playAttackAnimation() {
  //   let direction = this.gridEngine.getFacingDirection(this.playerRef.id);
  //   let melee = "MeleeAttack";
  //   console.log(direction);
  //   this.gridEngine.stopMovement("player");
  //   this.player.anims.play(direction + melee);

  // }

  //#region TURNBASED

  // dealDamageToEnemy(damage) {
  //   this.attackSound.play();
  //   this.currentNPC.healthCurrent = this.currentNPC.healthCurrent - damage;
  //   console.log("PLAYER ATTACKED ENEMY. Enemy health: " + this.currentNPC.healthCurrent);
  //   this.checkIfEnemyDead();
  // }

  // checkIfEnemyDead() {
  //   if (this.currentNPC.healthCurrent <= 0) {
  //     this.killCharacterAndSprite(this.currentNPC.id, this.currentNPC.sprite);
  //   }
  // }

  // killCharacterAndSprite(character, sprite) {
  //   this.gridEngine.removeCharacter(character);
  //   this.currentNPC = null;
  //   console.log(this.gridEngine.getAllCharacters());
  //   this.setThisSprite = sprite;
  //   this.setThisSprite.destroy();

  //   // remove data from array
  //   const removeFromDatabase = this.gridEngineConfig.characters.findIndex(item => item.id === character);
  //   this.gridEngineConfig.characters.splice(removeFromDatabase, 1);

  //   this.npcArray = [];
  //   const characters = this.gridEngineConfig.characters;
  //   for (const character of characters) {
  //     if (character.id !== 'player') {
  //       if (character.id.includes("enemy")) {
  //         this.npcArray.push(character);
  //       }
  //     }
  //   }
  // }

  //#region ENEMY TURN
  // async enemyTurn() {
  //   let enemyTurnDone = false;
  //   const characters = this.characterDatabase.characters;

  //   for (const character of characters) {
  //     if (character.id !== 'player') {
  //       this.currentEnemy = character;
  //       this.enemyDoSomething(this.currentEnemy);
  //       await timer(500);
  //     }
  //   }

  //   enemyTurnDone = true;
  //   if (enemyTurnDone) {
  //     this.resetPlayerTurn();
  //   }
  // }

  // enemyDoSomething(enemy) {
  //   let canMove = true;
  //   let canHeal = false;
  //   let canAttackRange = this.checkRangeOverlap(this.currentNPC.attack.range, this.currentNPC.id);
  //   let canAttackMelee = this.checkRangeOverlap(1, this.currentNPC.id);

  //   if (this.currentNPC.health.current != this.currentNPC.health.max)
  //     canHeal = true;

  //   let possibleMoves = [];

  //   if (canMove)
  //     possibleMoves.push("canMove");
  //   if (canAttackRange)
  //     possibleMoves.push("canAttackRange");
  //   if (canAttackMelee)
  //     possibleMoves.push("canAttackMelee");
  //   if (canHeal)
  //     possibleMoves.push("canHeal");

  //   let randomMove = Phaser.Math.RND.pick(possibleMoves);

  //   if (randomMove == "canMove") {
  //     // check if the character can move in x direction, if they can, make it possible move. 
  //     // https://annoraaq.github.io/grid-engine/typedoc/classes/GridEngine.html#isTileBlocked

  //     switch (this.getRandomIntFromMax(4)) {
  //       case 0:
  //         this.walkSound.play();
  //         this.gridEngine.move(this.currentNPC.id, "right");
  //         this.flipSprite(this.currentNPC.sprite, "right");
  //         break;
  //       case 1:
  //         this.walkSound.play();
  //         this.gridEngine.move(this.currentNPC.id, "left");
  //         this.flipSprite(this.currentNPC.sprite, "left");
  //         break;
  //       case 2:
  //         this.walkSound.play();
  //         this.gridEngine.move(this.currentNPC.id, "up");
  //         break;
  //       case 3:
  //         this.walkSound.play();
  //         this.gridEngine.move(this.currentNPC.id, "down");
  //         break;
  //     }
  //   }

  //   else if (randomMove == "canAttackRange") {
  //     //attack range
  //     this.dealDamageToPlayer(this.currentNPC.attack.rangeDMG);
  //   }

  //   else if (randomMove == "canAttackMelee") {
  //     // attack melee
  //     this.dealDamageToPlayer(this.currentNPC.attack.meleeDMG);
  //   }

  //   else if (randomMove == "canHeal") {
  //     this.currentNPC.health.current = this.currentNPC.health.current + 1;
  //     console.log("Enemy healed! " + this.currentNPC.id);
  //   }
  // }

  // dealDamageToPlayer(damage) {
  //   console.log("ATTACK DMG: " + damage + " from " + this.currentNPC.id);
  //   this.attackSound.play();
  //   this.player.healthCurrent = this.player.healthCurrent - damage;
  //   this.registry.set("playerHealth", this.player.healthCurrent);
  //   this.updateTextInUI(this.healthUI);
  // }

  // resetPlayerTurn() {
  //   this.playerTurn = true;
  //   this.playerTurns = this.playerTurnsMax;
  //   this.updateTextInUI(this.playerTurnsUI);
  //   this.playerMoveBegin();
  // }
  // //#endregion
  // //#endregion

  //#region OTHER FUNCTIONS
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

  // flipSprite(sprite, direction) {
  //   this.setThisSprite = sprite;
  //   let flipX;

  //   if (direction == "left") {
  //     flipX = true;
  //   }
  //   if (direction == "right") {
  //     flipX = false;
  //   }

  //   this.setThisSprite.flipX = flipX;
  // }

  getRandomIntFromMax(max) {
    return Math.floor(Math.random() * max);
  }
  //#endregion

  // //#region UI
  // updateTextInUI(nameUI) {
  //   if (nameUI == this.playerTurnsUI)
  //     this.playerTurnsUI.setText('Player turns: ' + this.playerTurns);
  //   if (nameUI == this.healthUI)
  //     this.healthUI.setText('Health: ' + this.player.healthCurrent);
  // }

  // visibilityUI(nameUI, visibility) {
  //   let visible = visibility;
  //   this.setThisUI = nameUI;

  //   if (visible) {
  //     this.setThisUI.visible = true;
  //   }
  //   else {
  //     this.setThisUI.visible = false;
  //   }
  // }
  // //#endregion
  //#endregion
}
