// https://photonstorm.github.io/phaser3-docs/

const timer = ms => new Promise(res => setTimeout(res, ms))

class Scene1 extends Phaser.Scene {
  constructor() {
    super({
      key: "scene1",
    });
  }

  preload() {
    //#region LOAD
    // LOAD RESOURCES

    // TILESET
    this.load.image(
      "tileSet",
      "images/tileset.png"
    );
    this.load.image(
      "tileSetSproutland",
      "images/tileset-sproutland.png"
    );
    this.load.tilemapTiledJSON("map", "source/tileMap.json");

    // PLAYER CHARACTER
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
    // NPCs (!!should change to spritesheet)
    this.load.image(
      "dinosaur",
      "images/dinosaur.png"
    );
    this.load.image(
      "dinosaurPurple",
      "images/dinosaur-purple.png"
    );

    this.enemySpriteNames = ["dinosaur", "dinosaurPurple", "dragon"];
    //#endregion

    //#region SET VARIABLES
    this.pixelSize = 16;
    this.playerTurnsMax = 10;
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
    // Basic move button
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

    //#region RENDER TILEMAP
    const tileMap = this.make.tilemap({ key: "map" });
    // "name of tileset in Tiled", "name of phaser tileset reference"
    const tileset = tileMap.addTilesetImage("tileset", "tileSet");
    const tilesetSproutland = tileMap.addTilesetImage("tileset-sproutland", "tileSetSproutland");
    // for (let i = 0; i < gameTilemap.layers.length; i++) {
    //   const layer = game.createLayer(i, "Game Map", 0, 0);
    // }
    // layer names from Tiled, tileset, x, y
    // https://phaser.io/docs/2.4.4/Phaser.TilemapLayer.html
    const groundLayer = tileMap.createLayer("Ground", [tileset, tilesetSproutland], 0, 0);
    const worldLayer = tileMap.createLayer("World", [tileset, tilesetSproutland], 0, 0);
    const world2Layer = tileMap.createLayer("World2", [tileset, tilesetSproutland], 0, 0);
    const fenceLayer = tileMap.createLayer("Fence", [tileset, tilesetSproutland], 0, 0);
    const roofLayer = tileMap.createLayer("Roof", [tileset, tilesetSproutland], 0, 0);

    //worldLayer.setCollisionByProperty({ ge_collide: true });
    //#endregion

    //#region ADD CHARACTERS AS SPRITES
    this.playerSprite = this.add.sprite(
      0, 0,
      "player"
    );

    // randomize enemy sprites

    this.numberOfEnemies = 4;

    //#region trying to autogen enemies
    // for (let i = 0; i < this.numberOfEnemies; i++) {
    //   //const element = this.numberOfEnemies[i];
    //   let enemyName = 'this.enemySprite' + (i+1);
    //   let randomEnemy = this.getRandomIntFromMax(this.enemySpriteNames.length);
    //   enemyName = this.add.sprite(
    //     0, 0,
    //     this.enemySpriteNames[randomEnemy]
    //   );
    //   console.log(enemyName);
    // }
    // for (let i = 0; i < this.numberOfEnemies; i++) {

    //   let enemyName = "enemySprite" + (i+1);
    //   let randomEnemy = this.getRandomIntFromMax(this.enemySpriteNames.length);
    //   this.enemyName = this.add.sprite(
    //     0, 0,
    //     this.enemySpriteNames[randomEnemy]
    //   );
    //   console.log(enemyName);
    //   // more statements
    // }
    //#endregion

    //this.randomEnemy = this.getRandomIntFromMax(this.enemySpriteNames.length);
    this.enemySprite1 = this.add.sprite(
      0, 0,
      this.enemySpriteNames[2]
    );
    //this.randomEnemy = this.getRandomIntFromMax(this.enemySpriteNames.length);
    this.enemySprite2 = this.add.sprite(
      0, 0,
      this.enemySpriteNames[2]
    );
    //this.randomEnemy = this.getRandomIntFromMax(this.enemySpriteNames.length);
    this.enemySprite3 = this.add.sprite(
      0, 0,
      this.enemySpriteNames[2]
    );
    //this.randomEnemy = this.getRandomIntFromMax(this.enemySpriteNames.length);
    this.enemySprite4 = this.add.sprite(
      0, 0,
      this.enemySpriteNames[2]
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
          attackMeleeDMG: 3,
          attackRange: 3,
          attackRangeDMG: 2,
        },
        {
          id: "enemy1",
          sprite: this.enemySprite1,
          startPosition: { x: 5, y: 7 },
          attackMeleeDMG: 2,
          attackRange: 2,
          attackRangeDMG: 1,
          health: 5,
        },
        {
          id: "enemy2",
          sprite: this.enemySprite2,
          startPosition: { x: 12, y: 10 },
          attackMeleeDMG: 2,
          attackRange: 2,
          attackRangeDMG: 1,
          health: 5,
        },
        {
          id: "enemy3",
          sprite: this.enemySprite3,
          startPosition: { x: 6, y: 14 },
          attackMeleeDMG: 2,
          attackRange: 2,
          attackRangeDMG: 1,
          health: 5,
        },
        {
          id: "enemy4",
          sprite: this.enemySprite4,
          startPosition: { x: 14, y: 5 },
          attackMeleeDMG: 2,
          attackRange: 2,
          attackRangeDMG: 1,
          health: 5,
        },
      ],
    };
    this.characterDatabase = this.gridEngineConfig;
    console.log(this.characterDatabase);

    this.gridEngine.create(tileMap, this.gridEngineConfig);
    //#endregion

    this.mapTileSize = 32;
    this.cameras.main.setBounds(0, 0, (this.mapTileSize * this.pixelSize), (this.mapTileSize * this.pixelSize));
    this.cameras.main.startFollow(this.playerSprite);

    //this.player.setCollideWorldBounds(true);

    // check for collisions
    // this.physics.add.collider(this.player, worldLayer);
    // this.physics.add.collider(this.dinosaur, worldLayer);

    //#region UI
    this.playerTurnsUI = this.add.text(0, 0, 'Player turns: ' + this.playerTurns);
    this.attackUI = this.add.text(0, 24, 'ATTACK');
    this.healthUI = this.add.text(0, 54, 'HEALTH:' + this.playerHealth);
    //#endregion

    //#region DEBUG MODE
    if (this.debugMode) {
      this.drawGrid();
    }
    //#endregion

    this.startGame();
  }

  update() {
  }

  //#region CUSTOM FUNCTIONS

  //#region CONTROLLER FUNCTIONS

  // check if the player actually moves !!!
  whenKeyUPPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.gridEngine.move("player", "up");
      this.playerMoveFinished();
    }
  }
  whenKeyDOWNPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.gridEngine.move("player", "down");
      this.playerMoveFinished();
    }
  }
  whenKeyLEFTPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.gridEngine.move("player", "left");
      //this.flipSprite(this.playerRef.sprite, "left");
      this.playerMoveFinished();
    }
  }
  whenKeyRIGHTPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.gridEngine.move("player", "right");
      //this.flipSprite(this.playerRef.sprite, "right");
      this.playerMoveFinished();
    }
  }
  whenKeyQPressed() {
    if ((this.playerTurn && this.playerTurns != 0)) {
      let myArray = this.characterDatabase.characters;

      myArray.forEach(character => {
        if (character.id == "player") {
          // no need to do anything
        }
        else if (character.id != "player") {
          this.currentEnemy = character;
          this.playerCanAttackMelee = this.checkRangeOverlap(1, this.currentEnemy.id);

          if (this.playerCanAttackMelee) {
            this.currentEnemy.health = this.currentEnemy.health - this.playerRef.attackMeleeDMG;
            console.log("PLAYER MELEE ATTACKED ENEMY");
            // if enemy has health =< 0, destroy them.
            if (this.currentEnemy.health <= 0) {
              this.killCharacterAndSprite(this.currentEnemy.id, this.currentEnemy.sprite);
            }
            this.playerMoveFinished();
          }
          else {
            this.playerCanAttackRange = this.checkRangeOverlap(this.playerRef.attackRange, this.currentEnemy.id);
            if (this.playerCanAttackRange) {
              this.currentEnemy.health = this.currentEnemy.health - this.playerRef.attackRangeDMG;
              console.log("PLAYER RANGE ATTACKED ENEMY");
              if (this.currentEnemy.health <= 0) {
                this.killCharacterAndSprite(this.currentEnemy.id, this.currentEnemy.sprite);
              }
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
    let myArray = this.characterDatabase.characters;

    myArray.forEach(character => {
      if (character.id == "player") {
        this.playerRef = character;
      }
    });

    this.playerMoveBegin();
  }

  playerMoveBegin() {
    this.canMove = true;
    this.checkIfCanAttackAndEnableUI();
  }

  checkIfCanAttackAndEnableUI() {
    this.inRangeMelee = 0;
    this.inRangeRange = 0;

    let myArray = this.characterDatabase.characters;

    myArray.forEach(character => {
      if (character.id != "player") {
        this.currentEnemy = character;

        if (this.checkRangeOverlap(1, this.currentEnemy.id)) {
          this.inRangeMelee++;
        }
        if (this.checkRangeOverlap(this.playerRef.attackRange, this.currentEnemy.id)) {
          this.inRangeRange++;
        }
      }
    });
    if (this.inRangeMelee > 0 || this.inRangeRange > 0) {
      this.visibilityUI(this.attackUI, true);
      //console.log("in range");
      //console.log(this.inRangeMelee + this.inRangeRange);
    }
    // else if (this.inRangeRange > 0) {
    //   this.visibilityUI(this.attackUI, true);
    //   console.log("in range range");
    // }
    else {
      this.visibilityUI(this.attackUI, false);
      //console.log("not in range");
    }
  }

  // Called after every player move.
  playerMoveFinished() {
    this.playerTurns--;
    this.setPlayerTurnsUI();
    this.checkIfCanAttackAndEnableUI();

    if (this.playerTurns == 0) {
      // If no more turns, end player turn.
      this.endPlayerTurn();
    }
  }

  // Called when the player has finished all their turns
  endPlayerTurn() {
    this.playerTurn = false;
    this.enemyTurn();
  }

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
    let canAttackRange = this.checkRangeOverlap(this.currentEnemy.attackRange, this.currentEnemy.id);
    let canAttackMelee = this.checkRangeOverlap(1, this.currentEnemy.id);
    let canMove = true;
    let movesPossible = 0;

    if (canMove)
      movesPossible++;
    if (canAttackRange)
      movesPossible++;
    if (canAttackMelee)
      movesPossible++;

    let randomMove = this.getRandomIntFromMax(movesPossible);

    if (randomMove == 0) {
      // let isTileBlockedUp = this.gridEngine.isBlocked(this.currentEnemy.x, this.currentEnemy.y + 1); 
      // console.log(isTileBlockedUp);
      // check if the character can move in x direction, if they can, make it possible move

      switch (this.getRandomIntFromMax(4)) {
        case 0:
          this.gridEngine.move(this.currentEnemy.id, "right");
          this.flipSprite(this.currentEnemy.sprite, "right");
          break;
        case 1:
          this.gridEngine.move(this.currentEnemy.id, "left");
          this.flipSprite(this.currentEnemy.sprite, "left");
          break;
        case 2:
          this.gridEngine.move(this.currentEnemy.id, "up");
          break;
        case 3:
          this.gridEngine.move(this.currentEnemy.id, "down");
          break;
      }
      //console.log("This is after said character move");
    }
    else if (randomMove == 1) {
      //attack range
      console.log("RANGE ATTACK");
      this.playerHealth = this.playerHealth - this.currentEnemy.attackRangeDMG;
      this.updateHealthUI();
    }

    else if (randomMove == 2) {
      // attack melee
      console.log("MELEE ATTACK");
      this.playerHealth = this.playerHealth - this.currentEnemy.attackMeleeDMG;
      this.updateHealthUI();

    }
  }

  resetPlayerTurn() {
    this.playerTurn = true;
    this.playerTurns = this.playerTurnsMax;
    this.setPlayerTurnsUI();
    this.playerMoveBegin();
  }

  checkRangeOverlap(range, enemy) {
    // check overlap range, use character and range
    let rangeOverlap;

    let playerPos = this.gridEngine.getPosition("player");
    let enemyPos = this.gridEngine.getPosition(enemy);
    let diffX = this.getDifference(enemyPos.x, playerPos.x);
    let diffY = this.getDifference(enemyPos.y, playerPos.y);
    //console.log(diffX);

    if (diffX <= range && diffY <= range) {
      //console.log("IN RANGE");
      return rangeOverlap = true;
    }
    else {
      return rangeOverlap = false;
    }
  }

  getDifference(a, b) {
    return Math.abs(a - b);
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
  //#endregion

  //#region UI
  setPlayerTurnsUI() {
    this.playerTurnsUI.setText('Player turns: ' + this.playerTurns);
  }
  updateHealthUI() {
    this.healthUI.setText('Health: ' + this.playerHealth);
  }

  visibilityUI(nameUI, visibility) {
    let visible = visibility;
    this.setThisUI = nameUI;

    if (visible == true) {
      this.setThisUI.visible = true;
    }
    else if (visible == false) {
      this.setThisUI.visible = false;
    }
  }
  //#endregion


  //#region OTHER FUNCTIONS
  flipSprite(sprite, direction) {
    this.setThisSprite = sprite;
    let flipX;

    if (direction == "left") {
      flipX = false;
    }
    if (direction == "right") {
      flipX = true;
    }

    this.setThisSprite.flipX = flipX;
  }
  spawn(gridPlacement, offset) {
    const gridSize = 16;
    const place = gridPlacement * gridSize - offset;
    return place;
  }
  getRandomIntFromMax(max) {
    return Math.floor(Math.random() * max);
  }
  //#endregion

  //#region DEBUG
  drawGrid() {
    // https://phaser.io/examples/v3/view/game-objects/shapes/grid
    // https://newdocs.phaser.io/docs/3.55.2/Phaser.GameObjects.Grid
    let g1 = this.add.grid((this.mapTileSize * this.pixelSize / 2), (this.mapTileSize * this.pixelSize / 2), (this.mapTileSize * this.pixelSize), (this.mapTileSize * this.pixelSize), 16, 16, 0xff0000, 0.2);
  }
  //#endregion

  //#endregion
}

