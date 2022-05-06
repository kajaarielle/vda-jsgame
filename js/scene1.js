// https://photonstorm.github.io/phaser3-docs/

const timer = ms => new Promise(res => setTimeout(res, ms))

class Scene1 extends Phaser.Scene {
  constructor() {
    super({
      key: "scene1",
    });
  }

  preload() {
    //#region LOAD RESOURCES

    //#region TILEMAP
    this.load.image(
      "tileSet",
      "images/tileset.png"
    );
    this.load.image(
      "tileSetSproutland",
      "images/tileset-sproutland.png"
    );
    this.load.tilemapTiledJSON("map", "source/tileMap.json");
    //#endregion

    //#region CHARACTERS
    this.load.spritesheet(
      "player",
      "images/cat-spritesheet.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );
    this.load.spritesheet(
      "dragon",
      "images/dragon-spritesheet.png",
      {
        frameWidth: 24,
        frameHeight: 24,
      }
    );
    this.enemySpriteNames = ["dragon"];
    //#endregion

    //#region AUDIO
    this.load.audio("music", ["audio/music.mp3"]);
    this.load.audio("attack", ["audio/attack.mp3"]);
    this.load.audio("walk", ["audio/walk.mp3"]);
    //#endregion
    //#endregion

    //#region SET VARIABLES
    this.pixelSize = 16;
    this.mapTileSize = 32;
    this.playerTurnsMax = 5;
    this.playerTurns = this.playerTurnsMax;
    this.playerTurn = true;
    this.moveSpeed = 16;
    this.playerHealth = 10;
    this.debugMode = false;
    //#endregion
  }

  create() {
    console.log("Printing 'phaser.this': ", this);

    //#region PLAYER INPUT CONTROLLER
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyUp.on("down", this.whenKeyUPPressed, this);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyDown.on("down", this.whenKeyDOWNPressed, this);
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyLeft.on("down", this.whenKeyLEFTPressed, this);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyRight.on("down", this.whenKeyRIGHTPressed, this);
    this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyQ.on("down", this.whenKeyQPressed, this);
    //#endregion

    //#region ADD SOUNDS
    this.attackSound = this.sound.add("attack", { loop: false });
    this.walkSound = this.sound.add("walk", { loop: false, volume: 0.5 });
    this.musicSound = this.sound.add("music", { loop: true, volume: 0.1 });
    //#endregion

    //#region RENDER TILEMAP
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
    //#endregion

    //#region ADD CHARACTERS AS SPRITES
    this.playerSprite = this.add.sprite(
      0, 0,
      "player"
    );
    this.enemySprite1 = this.add.sprite(
      0, 0,
      this.enemySpriteNames[0]
    );
    this.enemySprite2 = this.add.sprite(
      0, 0,
      this.enemySpriteNames[0]
    );
    this.enemySprite3 = this.add.sprite(
      0, 0,
      this.enemySpriteNames[0]
    );
    this.enemySprite4 = this.add.sprite(
      0, 0,
      this.enemySpriteNames[0]
    );
    //#endregion

    //#region GRID ENGINE CONFIG
    this.gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.playerSprite,
          walkingAnimationMapping: {
            up: {
              leftFoot: 6,
              standing: 5,
              rightFoot: 7,
            },
            down: {
              leftFoot: 2,
              standing: 1,
              rightFoot: 3,
            },
            left: {
              leftFoot: 10,
              standing: 9,
              rightFoot: 11,
            },
            right: {
              leftFoot: 14,
              standing: 13,
              rightFoot: 15,
            },
          },
          startPosition: { x: 2, y: 2 },
          offsetY: 16,
          attack: {
            range: 3,
            meleeDMG: 3,
            rangeDMG: 2,
          },
        },
        {
          id: "enemy1",
          sprite: this.enemySprite1,
          startPosition: { x: 5, y: 7 },
          attack: {
            range: 2,
            meleeDMG: 2,
            rangeDMG: 1,
          },
          health: {
            max: 5,
            current: 5,
          },
        },
        {
          id: "enemy2",
          sprite: this.enemySprite2,
          startPosition: { x: 12, y: 10 },
          attack: {
            range: 2,
            meleeDMG: 2,
            rangeDMG: 1,
          },
          health: {
            max: 5,
            current: 5,
          },
        },
        {
          id: "enemy3",
          sprite: this.enemySprite3,
          startPosition: { x: 6, y: 14 },
          attack: {
            range: 2,
            meleeDMG: 2,
            rangeDMG: 1,
          },
          health: {
            max: 5,
            current: 5,
          },
        },
        {
          id: "enemy4",
          sprite: this.enemySprite4,
          startPosition: { x: 14, y: 5 },
          attack: {
            range: 2,
            meleeDMG: 2,
            rangeDMG: 1,
          },
          health: {
            max: 5,
            current: 5,
          },
        },
      ],
    };

    this.characterDatabase = this.gridEngineConfig;
    this.gridEngine.create(tileMap, this.gridEngineConfig);
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

    this.startGame();
  }

  update() {
  }

  //#region CUSTOM FUNCTIONS

  //#region CONTROLLER FUNCTIONS
  // TODO: check if the player actually moves, otherwise a turn still goes !!!
  whenKeyUPPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.walkSound.play();
      this.gridEngine.move("player", "up");
      this.playerMoveFinished();
    }
  }
  whenKeyDOWNPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.walkSound.play();
      this.gridEngine.move("player", "down");
      this.playerMoveFinished();
    }
  }
  whenKeyLEFTPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.walkSound.play();
      this.gridEngine.move("player", "left");
      this.playerMoveFinished();
    }
  }
  whenKeyRIGHTPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.walkSound.play();
      this.gridEngine.move("player", "right");
      this.playerMoveFinished();
    }
  }
  whenKeyQPressed() {
    if ((this.playerTurn && this.playerTurns != 0)) {
      // Check if the player is in range to any enemies for each enemy character
      let characterArray = this.characterDatabase.characters;

      characterArray.forEach(character => {
        if (character.id != "player") {
          this.currentEnemy = character;
          this.playerCanAttackMelee = this.checkRangeOverlap(1, this.currentEnemy.id);

          if (this.playerCanAttackMelee) {
            this.dealDamageToEnemy(this.playerRef.attack.meleeDMG);
            this.playerMoveFinished();
          }

          else {
            this.playerCanAttackRange = this.checkRangeOverlap(this.playerRef.attack.range, this.currentEnemy.id);

            if (this.playerCanAttackRange) {
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

  //#region TURNBASED

  startGame() {
    this.musicSound.play();
    let characterArray = this.characterDatabase.characters;

    characterArray.forEach(character => {
      if (character.id == "player") {
        this.playerRef = character;
      }
    });

    this.playerMoveBegin();
  }

  //#region PLAYER TURN
  playerMoveBegin() {
    this.checkIfCanAttackAndEnableUI();
  }

  checkIfCanAttackAndEnableUI() {
    let inRangeMelee = 0;
    let inRangeRange = 0;

    let characterArray = this.characterDatabase.characters;

    characterArray.forEach(character => {
      if (character.id != "player") {
        this.currentEnemy = character;

        if (this.checkRangeOverlap(1, this.currentEnemy.id)) {
          inRangeMelee++;
        }

        if (this.checkRangeOverlap(this.playerRef.attack.range, this.currentEnemy.id)) {
          inRangeRange++;
        }
      }
    });

    if (inRangeMelee > 0 || inRangeRange > 0) {
      this.visibilityUI(this.attackUI, true);
    }

    else {
      this.visibilityUI(this.attackUI, false);
    }
  }

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
    const removeFromDatabase = this.characterDatabase.characters.findIndex(item => item.id === character);
    this.characterDatabase.characters.splice(removeFromDatabase, 1);
  }

  // Called after every player move.
  playerMoveFinished() {
    this.playerTurns--;
    this.updateTextInUI(this.playerTurnsUI);
    this.checkIfCanAttackAndEnableUI();

    // If no more turns, end player turn.
    if (this.playerTurns == 0) {
      this.endPlayerTurn();
    }
  }

  // Called when the player has finished all their turns
  endPlayerTurn() {
    this.playerTurn = false;
    this.enemyTurn();
  }
  //#endregion

  //#region ENEMY TURN
  async enemyTurn() {
    let enemyTurnDone = false;
    const characters = this.characterDatabase.characters;

    for (const character of characters) {
      if (character.id !== 'player') {
        this.currentEnemy = character;
        this.enemyDoSomething(this.currentEnemy);
        await timer(500);
      }
    }

    enemyTurnDone = true;
    if (enemyTurnDone) {
      this.resetPlayerTurn();
    }
  }

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

