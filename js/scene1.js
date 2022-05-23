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
    this.load.tilemapTiledJSON("map", "source/tileMap.json");

    this.load.spritesheet("player", "images/spritesheet-custom-2.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("dragon", "images/dragon-spritesheet.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("charactersheet", "images/characters.png", {
      frameWidth: 52,
      frameHeight: 72,
    });
    this.load.spritesheet("chicken", "images/chicken.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.audio("music", ["audio/music.mp3"]);
    this.load.audio("attack", ["audio/attack.mp3"]);
    this.load.audio("walk", ["audio/walk.mp3"]);
    //#endregion

    //#region SET VARIABLES
    this.pixelSize = 16;
    this.mapTileSize = 32;
    this.playerHealth = 10;
    this.debugMode = false;
    //#endregion
  }

  create() {
    //#region PLAYER INPUT CONTROLLER
    this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyQ.on("down", this.whenKeyQPressed, this);

    this.controls = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    //#endregion

    this.generateSounds();
    const { tileMap, collisionLayers } = this.generateTilemap();
    this.generatePlayer();
    this.gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.playerSprite,
          walkingAnimationMapping: 0,
          startPosition: { x: 2, y: 2 },
          attack: {
            range: 3,
            meleeDMG: 3,
            rangeDMG: 2,
          },
        },
      ],
    };

    //#region AI/NPC CHARACTERS
    this.generateNPC();
    this.generateChicken();
    this.generateEnemy();

    this.gridEngine.create(tileMap, this.gridEngineConfig);

    this.makeSpecificCharacterArrays();
    this.characterMoveHandler();
    //#endregion

    //#region CAMERA
    this.cameras.main.setBounds(0, 0, (this.mapTileSize * this.pixelSize), (this.mapTileSize * this.pixelSize));
    this.cameras.main.startFollow(this.playerSprite);
    //#endregion

    //#region UI
    this.playerTurnsUI = this.add.text(0, 0, 'Player turns: ' + this.playerTurns).setScrollFactor(0);
    this.healthUI = this.add.text(0, 24, 'HEALTH:' + this.playerHealth).setScrollFactor(0);
    this.attackUI = this.add.text(0, 54, 'ATTACK').setScrollFactor(0);
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

    // Last stuff to do
    this.registry.set("playerHealth", this.playerHealth);
  }

  generateSounds() {
    this.attackSound = this.sound.add("attack", { loop: false });
    this.walkSound = this.sound.add("walk", { loop: false, volume: 0.5 });
    this.musicSound = this.sound.add("music", { loop: true, volume: 0.1 });

    this.musicSound.play();
  }

  generateTilemap() {
    const tileMap = this.make.tilemap({ key: "map" });
    // "name of tileset in Tiled", "name of phaser tileset reference"
    const tileset = tileMap.addTilesetImage("tileset", "tileSet");
    const tilesetSproutland = tileMap.addTilesetImage("tileset-sproutland", "tileSetSproutland");
    // layer names from Tiled ( tileset, x, y ) https://phaser.io/docs/2.4.4/Phaser.TilemapLayer.html
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
    this.playerSprite = this.add.sprite(
      0, 0,
      "player"
    );
    this.physics.add.existing(this.playerSprite);

    this.registry.set("playerHealth", this.playerHealth);

    // this.playerAttacks = this.generateAttacks('sword', 1);

    // this.createPlayerAnimation.call(this, "downMeleeAttack", 12, 13);
    // this.createPlayerAnimation.call(this, "upMeleeAttack", 15, 16);
    // this.createPlayerAnimation.call(this, "leftMeleeAttack", 18, 19);
    // this.createPlayerAnimation.call(this, "rightMeleeAttack", 21, 22);
  }

  characterMoveHandler() {
    this.npcArray.forEach(npc => {
      this.gridEngine.moveRandomly(npc.id, this.getRandomInt(0, 1500));
    });

    this.chickenArray.forEach(chicken => {
      this.gridEngine.moveRandomly(chicken.id, this.getRandomInt(0, 1500));
    });

    this.enemyArray.forEach(enemy => {
      this.gridEngine.moveRandomly(enemy.id, this.getRandomInt(0, 1500));
    });
  }

  generateEnemy() {
    for (let x = 19; x <= 20; x++) {
      for (let y = 22; y <= 23; y++) {
        const spr = this.add.sprite(0, 0, "dragon");
        this.physics.add.existing(spr);
        this.gridEngineConfig.characters.push({
          id: `enemy${x}#${y}`,
          sprite: spr,
          // walkingAnimationMapping: 0,
          startPosition: { x, y },
          speed: 2,
        });
      }
    }
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
    for (let x = 4; x <= 7; x++) {
      for (let y = 5; y <= 8; y++) {
        const spr = this.add.sprite(0, 0, "charactersheet");
        spr.scale = 0.25;
        this.physics.add.existing(spr);
        this.gridEngineConfig.characters.push({
          id: `npc${x}#${y}`,
          sprite: spr,
          walkingAnimationMapping: this.getRandomInt(0, 6),
          startPosition: { x, y },
          speed: 2,
        });
      }
    }
  }
  makeSpecificCharacterArrays() {
    this.npcArray = [];
    this.chickenArray = [];
    this.enemyArray = [];

    const characters = this.gridEngineConfig.characters;
    for (const character of characters) {
      if (character.id !== 'player') {
        if (character.id.includes("npc")) {
          this.npcArray.push(character);
        }
        else if (character.id.includes("chicken")) {
          this.chickenArray.push(character);
        }
        else if (character.id.includes("enemy")) {
          this.enemyArray.push(character);
        }
        else if (character.id == "player") {
          this.playerRef = character;
        }
      }
    }
    console.log(this.npcArray);
    console.log(this.chickenArray);
    console.log(this.enemyArray);
  }

  update() {
    
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

  playerHandler() {
    this.playerMovementHandler();

    
    if (this.input.activePointer.isDown) {
      this.playerAttacks.rate = 1000 - (this.player.speed * 4);
      if (this.playerAttacks.rate < 200) {
        this.playerAttacks.rate = 200;
      }
      this.playerAttacks.range = this.player.strength * 3;
      this.attack(this.player, this.playerAttacks);
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
  createEnemyAnimation(character, name, startFrame, endFrame) {
    this.anims.create({
      key: name,
      frames: this.anims.generateFrameNumbers(character, {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 6,
      repeat: 0,
      yoyo: true,
    });
  }

  //#region CONTROLLER FUNCTIONS

  whenKeyQPressed() {
    if ((this.playerTurn && this.playerTurns != 0)) {
      // Check if the player is in range to any enemies for each enemy character
      let characterArray = this.gridEngineConfig.characters;

      characterArray.forEach(character => {
        if (character.id != "player") {
          this.currentEnemy = character;
          this.playerCanAttackMelee = this.checkRangeOverlap(1, this.currentEnemy.id);

          if (this.playerCanAttackMelee) {
            let direction = this.getPlayerDirectionBeforeAttack;
            this.playAttackAnimation("melee");
            this.dealDamageToEnemy(this.playerRef.attack.meleeDMG);
            this.playerMoveFinished();
          }

          else {
            this.playerCanAttackRange = this.checkRangeOverlap(this.playerRef.attack.range, this.currentEnemy.id);

            if (this.playerCanAttackRange) {
              this.playAttackAnimation("range");
              this.dealDamageToEnemy(this.playerRef.attack.rangeDMG);
              this.playerMoveFinished();
            }

            else {
              console.log("You're not close enough for attack");
            }
          }
        }
      });
    }
  }
  //#endregion

  playAttackAnimation(attackType) {
    let direction = this.gridEngine.getFacingDirection(this.playerRef.id);
    let melee = "MeleeAttack";
    let range = "RangeAttack";
    console.log(direction);

    if (attackType == "melee") {
      this.playerSprite.anims.play(direction + melee);
    }
    if (attackType == "range") {
      // this.playerSprite.anims.play(direction + range);

      let playerX = this.playerSprite.x + 24;
      let playerY = this.playerSprite.y + 24;
      this.bullets.fireBullet(playerX, playerY);

    }
  }

  //#region TURNBASED

  startGame() {
    // this.registry.set("playerTurns", this.playerTurnsMax);
    this.registry.set("playerHealth", this.playerHealth);
    // this.playerMoveBegin();
  }

  //#region PLAYER TURN
  // playerMoveBegin() {
  //   this.checkIfCanAttackAndEnableUI();
  // }

  // checkIfCanAttackAndEnableUI() {
  //   let inRangeMelee = 0;
  //   let inRangeRange = 0;

  //   this.enemyArray.forEach(enemy => {
  //     this.currentEnemy = enemy;

  //       if (this.checkRangeOverlap(1, this.currentEnemy.id)) {
  //         inRangeMelee++;
  //       }

  //       if (this.checkRangeOverlap(this.playerRef.attack.range, this.currentEnemy.id)) {
  //         inRangeRange++;
  //       }
  //   });


  //   if (inRangeMelee > 0 || inRangeRange > 0) {
  //     this.visibilityUI(this.attackUI, true);
  //   }

  //   else {
  //     this.visibilityUI(this.attackUI, false);
  //   }
  // }

  dealDamageToEnemy(damage) {
    this.attackSound.play();
    this.currentEnemy.health.current = this.currentEnemy.health.current - damage;
    console.log("PLAYER ATTACKED ENEMY. Enemy health: " + this.currentEnemy.health.current);
    this.checkIfEnemyDead();
  }

  checkIfEnemyDead() {
    if (this.currentEnemy.health.current <= 0) {
      this.killCharacterAndSprite(this.currentEnemy.id, this.currentEnemy.sprite);
    }
  }

  killCharacterAndSprite(character, sprite) {
    this.gridEngine.removeCharacter(character);
    console.log(this.gridEngine.getAllCharacters());
    this.setThisSprite = sprite;
    this.setThisSprite.destroy();

    // remove data from array
    const removeFromDatabase = this.gridEngineConfig.characters.findIndex(item => item.id === character);
    this.gridEngineConfig.characters.splice(removeFromDatabase, 1);
  }

  // // Called after every player move.
  // playerMoveFinished() {
  //   this.playerTurns--;
  //   this.registry.set("playerTurns", this.playerTurns);
  //   this.updateTextInUI(this.playerTurnsUI);
  //   this.checkIfCanAttackAndEnableUI();

  //   // If no more turns, end player turn.
  //   if (this.playerTurns == 0) {
  //     this.endPlayerTurn();
  //   }
  // }

  // // Called when the player has finished all their turns
  // endPlayerTurn() {
  //   this.playerTurn = false;
  //   this.enemyTurn();
  // }
  //#endregion

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

  enemyDoSomething(enemy) {
    let canMove = true;
    let canHeal = false;
    let canAttackRange = this.checkRangeOverlap(this.currentEnemy.attack.range, this.currentEnemy.id);
    let canAttackMelee = this.checkRangeOverlap(1, this.currentEnemy.id);

    if (this.currentEnemy.health.current != this.currentEnemy.health.max)
      canHeal = true;

    let possibleMoves = [];

    if (canMove)
      possibleMoves.push("canMove");
    if (canAttackRange)
      possibleMoves.push("canAttackRange");
    if (canAttackMelee)
      possibleMoves.push("canAttackMelee");
    if (canHeal)
      possibleMoves.push("canHeal");

    let randomMove = Phaser.Math.RND.pick(possibleMoves);

    if (randomMove == "canMove") {
      // check if the character can move in x direction, if they can, make it possible move. 
      // https://annoraaq.github.io/grid-engine/typedoc/classes/GridEngine.html#isTileBlocked

      switch (this.getRandomIntFromMax(4)) {
        case 0:
          this.walkSound.play();
          this.gridEngine.move(this.currentEnemy.id, "right");
          this.flipSprite(this.currentEnemy.sprite, "right");
          break;
        case 1:
          this.walkSound.play();
          this.gridEngine.move(this.currentEnemy.id, "left");
          this.flipSprite(this.currentEnemy.sprite, "left");
          break;
        case 2:
          this.walkSound.play();
          this.gridEngine.move(this.currentEnemy.id, "up");
          break;
        case 3:
          this.walkSound.play();
          this.gridEngine.move(this.currentEnemy.id, "down");
          break;
      }
    }

    else if (randomMove == "canAttackRange") {
      //attack range
      this.dealDamageToPlayer(this.currentEnemy.attack.rangeDMG);
    }

    else if (randomMove == "canAttackMelee") {
      // attack melee
      this.dealDamageToPlayer(this.currentEnemy.attack.meleeDMG);
    }

    else if (randomMove == "canHeal") {
      this.currentEnemy.health.current = this.currentEnemy.health.current + 1;
      console.log("Enemy healed! " + this.currentEnemy.id);
    }
  }

  dealDamageToPlayer(damage) {
    console.log("ATTACK DMG: " + damage + " from " + this.currentEnemy.id);
    this.attackSound.play();
    this.playerHealth = this.playerHealth - damage;
    this.registry.set("playerHealth", this.playerHealth);
    this.updateTextInUI(this.healthUI);
  }

  resetPlayerTurn() {
    this.playerTurn = true;
    this.playerTurns = this.playerTurnsMax;
    this.updateTextInUI(this.playerTurnsUI);
    this.playerMoveBegin();
  }
  //#endregion
  //#endregion

  //#region OTHER FUNCTIONS
  checkRangeOverlap(range, enemy) {
    let rangeOverlap;

    let playerPos = this.gridEngine.getPosition("player");
    let enemyPos = this.gridEngine.getPosition(enemy);
    let diffX = this.getDifference(enemyPos.x, playerPos.x);
    let diffY = this.getDifference(enemyPos.y, playerPos.y);

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

  flipSprite(sprite, direction) {
    this.setThisSprite = sprite;
    let flipX;

    if (direction == "left") {
      flipX = true;
    }
    if (direction == "right") {
      flipX = false;
    }

    this.setThisSprite.flipX = flipX;
  }

  getRandomIntFromMax(max) {
    return Math.floor(Math.random() * max);
  }
  //#endregion

  //#region UI
  updateTextInUI(nameUI) {
    if (nameUI == this.playerTurnsUI)
      this.playerTurnsUI.setText('Player turns: ' + this.playerTurns);
    if (nameUI == this.healthUI)
      this.healthUI.setText('Health: ' + this.playerHealth);
  }

  visibilityUI(nameUI, visibility) {
    let visible = visibility;
    this.setThisUI = nameUI;

    if (visible) {
      this.setThisUI.visible = true;
    }
    else {
      this.setThisUI.visible = false;
    }
  }
  //#endregion
  //#endregion
}

