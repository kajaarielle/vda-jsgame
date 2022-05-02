// https://photonstorm.github.io/phaser3-docs/

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
    this.load.tilemapTiledJSON("map", "source/tileMap.json");

    // PLAYER CHARACTER
    this.load.spritesheet(
      "player",
      "images/player.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    // this.load.image(
    //   "shadow",
    //   "https://cdn.glitch.global/7cb1200c-06f4-461b-a749-328eb4b05845/shadow.png?v=1649351722677"
    // );
    // NPCs (!!should change to spritesheet)
    this.load.image(
      "dinosaur",
      "images/dinosaur.png"
    );
    //#endregion

    //#region SET VARIABLES
    this.pixelSize = 16;
    this.debugMode = true;

    this.playerTurnsMax = 3;
    this.playerTurns = 3;
    this.playerTurn = true;
    this.moveSpeed = 16;

    this.target = new Phaser.Math.Vector2();

    // this.controller = new Controller(this);
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
    //#endregion

    //#region RENDER TILEMAP
    const tileMap = this.make.tilemap({ key: "map" });
    // "name of tileset in Tiled", "name of phaser tileset reference"
    const tileset = tileMap.addTilesetImage("tileset", "tileSet");
    // for (let i = 0; i < gameTilemap.layers.length; i++) {
    //   const layer = game.createLayer(i, "Game Map", 0, 0);
    // }
    // layer names from Tiled, tileset, x, y
    const groundLayer = tileMap.createLayer("Ground", tileset, 0, 0);
    const worldLayer = tileMap.createLayer("World", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ ge_collide: true });
    //#endregion

    //#region ADD CHARACTERS AS SPRITES
    this.playerSprite = this.add.sprite(
      this.spawn(4, 8), // x
      this.spawn(3, 0), // y
      "player"
    );
    this.dinosaurSprite = this.add.sprite(
      this.spawn(7, 12), // x
      this.spawn(7, 2), // y
      "dinosaur"
    );
    this.dinosaurSprite2 = this.add.sprite(
      this.spawn(10, 12), // x
      this.spawn(10, 2), // y
      "dinosaur"
    );
    //#endregion

    //#region GRID ENGINE CONFIG
    this.gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.playerSprite,
          //walkingAnimationMapping: ,
          startPosition: { x: 1, y: 2 },
          attackMeleeDMG: 3,
          attackRange: 3,
          attackRangeDMG: 2,
        },
        {
          id: "dinosaur",
          sprite: this.dinosaurSprite,
          startPosition: { x: 6, y: 8 },
          attackMeleeDMG: 2,
          attackRange: 2,
          attackRangeDMG: 1,
        },
        {
          id: "dinosaur2",
          sprite: this.dinosaurSprite2,
          startPosition: { x: 8, y: 10 },
          attackMeleeDMG: 2,
          attackRange: 2,
          attackRangeDMG: 1,
        },
      ],
    };
    this.enemyNumbers = Object.keys(this.gridEngineConfig.characters).length - 1;
    //this.enemies = ["dinosaur", "dinosaur2"];


    this.gridEngine.create(tileMap, this.gridEngineConfig);
    //#endregion

    //this.player.setCollideWorldBounds(true);

    // check for collisions
    this.physics.add.collider(this.player, worldLayer);
    this.physics.add.collider(this.dinosaur, worldLayer);

    //#region UI
    this.playerTurnsUI = this.add.text(0, 0, 'Player turns: ' + this.playerTurns);
    this.testUI = this.add.text(0, 24, 'ATTACK');
    //#endregion

    //#region DEBUG MODE
    if (this.debugMode) {
      this.drawGrid();
    }
    //#endregion
  }

  update() {
    //#region TEST PLAYER MOVEMENT

    // var isUpDown = this.input.keyboard.checkDown(this.controller.keyUp)
    // if (isUpDown) {
    //   if (this.playerTurn && this.playerTurns != 0) {
    //     // move


    //   }
    // }

    // var isDownDown = this.input.keyboard.checkDown(this.controller.keyDown)
    // if (isDownDown) {
    //   if (this.playerTurn && this.playerTurns != 0) {
    //     // move
    //     this.playerTurns--;
    //     this.setTextUI();
    //     if (this.playerTurns == 0) {
    //       this.endPlayerTurn();
    //     }
    //   }
    // }

    // var isLeftDown = this.input.keyboard.checkDown(this.controller.keyLeft)
    // if (isLeftDown) {
    //   if (this.playerTurn && this.playerTurns != 0) {
    //     // move
    //     this.playerTurns--;
    //     this.setTextUI();
    //     if (this.playerTurns == 0) {
    //       this.endPlayerTurn();
    //     }
    //   }
    // }

    // var isRightDown = this.input.keyboard.checkDown(this.controller.keyRight)
    // if (isRightDown) {
    //   if (this.playerTurn && this.playerTurns != 0) {
    //     // move
    //     this.playerTurns--;
    //     this.setTextUI();
    //     if (this.playerTurns == 0) {
    //       this.endPlayerTurn();
    //     }
    //   }
    // }
    //#endregion
  }

  //#region CUSTOM FUNCTIONS

  //#region CONTROLLER FUNCTIONS
  whenKeyUPPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.gridEngine.move("player", "up");
      // check if the player moved or not during their turn
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
      //this.visibilityUI(this.testUI, false);

      this.playerMoveFinished();
    }

  }
  whenKeyRIGHTPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.gridEngine.move("player", "right");
      this.playerMoveFinished();
    }
  }
  //#endregion
  whenKeyQPressed() {
    // do something
    var canMove = this.playerMoveFreely;

    if (canMove) this.playerMoveFreely = false;
    else this.playerMoveFreely = true;

    console.log(this.playerMoveFreely);
  }
  //#region TURNBASED

  // Called after every player move.
  playerMoveFinished() {
    this.playerTurns--;
    this.setTextUI();
    if (this.playerTurns == 0) {
      // If no more turns, end player turn.
      this.endPlayerTurn();
    }
  }

  // Called when the player has finished all their turns
  endPlayerTurn() {
    console.log("Player turn over");
    this.enemyTurn();
  }

  // Called after player turn, before resetting max player turns
  enemyTurn() {
    var enemyTurnDone = false;
    //this.gridEngine.
    // loop every enemy array and make them run their turn
    // after all enemies are done with their moves set enemyTurnDone = true;
    // for (let i = 0; i < this.enemyNumbers; i++) {
    //   this.enemyDoSomething(this.gridEngineConfig.characters[i]);
    // }
    let myArray = this.gridEngineConfig.characters;

    myArray.forEach(element => {
      if(element.id != "player") {
        this.currentEnemy = element;
      this.enemyDoSomething(element)
      }
    });


    //this.enemyDoSomething("dinosaur");

    enemyTurnDone = true;

    if (enemyTurnDone) {
      this.resetPlayerTurn();
    }
  }
  enemyDoSomething(enemy) {
    console.log(enemy);

    // 1. check if the enemy is in range to player
    // 2. if they are, it is possible to do attack (range vs melee?)
    // 3. select randomMoveInt based on moves possible
    let movesPossible = 0;

    let canAttackRange = this.checkRangeOverlap(enemy, this.currentEnemy.attackRange);
    let canAttackMelee = this.checkRangeOverlap(enemy, 1);
    let canMove = true;

    if (canMove)
      movesPossible++;
    if (canAttackRange)
      movesPossible++;
    if (canAttackMelee)
      movesPossible++;

    let randomMove = this.getRandomIntFromMax(movesPossible);

    if (randomMove == 0) {
      console.log("Character should do a move now");
      //move
      // check if the character can move in x direction, if they can, make it possible move

      switch (this.getRandomIntFromMax(4)) {
        case 0:
          this.gridEngine.move(this.currentEnemy.id, "right");
          break;
        case 1:
          this.gridEngine.move(this.currentEnemy.id, "left");
          break;
        case 2:
          this.gridEngine.move(this.currentEnemy.id, "up");
          break;
        case 3:
          this.gridEngine.move(this.currentEnemy.id, "down");
          break;
      }
      console.log("This is after said character move");
    }
    else if (randomMove == 1) {
      //attack range
    }

    else if (randomMove == 2) {
      // attack melee
    }
  }
  checkRangeOverlap(character, range) {
    // check overlap range, use character and range
    let rangeOverlap = false;

    return rangeOverlap;
  }

  resetPlayerTurn() {
    this.playerTurn = true;
    this.playerTurns = this.playerTurnsMax
    this.setTextUI();
  }

  surroundingPlayerTiles() {
    let x = this.player.x;
    let y = this.player.y;
  }

  // if this.playerTurns != 0
  // player can do one of x
  // when done x, this.playerTurns -- (minus icrement)
  // call randomEnemyTurn() after last turn (DO NOT CALL IT ON ELSE), use console.log to check if it calls once at correct time
  //this.overlapZone.body.debugBodyColor = this.overlapZone.body.touching.none ? 0x00ffff : 0xffff00;

  //   if (this.debugMode)
  //     this.containerText.text = `canMove: ${this.playerMoveFreely}`;
  // }
  // switch or while?
  // playerAction number needs to be set in update?

  // afterPlayerAction() {
  //   this.playerTurns - 1;
  //   console.log(this.playerTurns);
  //   if (this.playerTurns == 0) {
  //     //this.randomEnemyTurn();
  //   }
  // }

  // randomEnemyTurn() {
  //   // if this.playerTurns == 0
  //   // do one of x actions

  //   this.playerTurns = this.playerTurnsMax;
  //   console.log("Reset turns");
  // }
  //#endregion

  //#region UI
  setTextUI() {
    this.playerTurnsUI.setText('Player turns: ' + this.playerTurns);
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
    var g1 = this.add.grid(128, 128, 256, 256, 16, 16, 0xff0000, 0.2);
  }
  //#endregion

  //#endregion
}

