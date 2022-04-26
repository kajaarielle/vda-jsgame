// https://photonstorm.github.io/phaser3-docs/

class Scene1 extends Phaser.Scene {
  constructor() {
    super({
      key: "scene1",
    });
  }

  preload() {
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

    // Set variables
    this.pixelSize = 16;
    this.debugMode = true;

    this.playerTurnsMax = 3;
    this.playerTurns = 3;
    this.playerTurn = true;
    this.moveSpeed = 16;

    // this.controller = new Controller(this);
  }

  create() {
    this.debuggy = this.add.graphics();


    console.log("Printing 'phaser.this': ", this);

    // Basic move button
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyUp.on("down", this.whenKeyUPPressed, this);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyDown.on("down", this.whenKeyDOWNPressed, this);
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyLeft.on("down", this.whenKeyLEFTPressed, this);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyRight.on("down", this.whenKeyRIGHTPressed, this);


    // RENDER TILEMAP
    const tileMap = this.make.tilemap({ key: "map" });
    // "name of tileset in Tiled", "name of phaser tileset reference"
    const tileset = tileMap.addTilesetImage("tileset", "tileSet");
    // for (let i = 0; i < gameTilemap.layers.length; i++) {
    //   const layer = game.createLayer(i, "Game Map", 0, 0);
    // }
    // layer names from Tiled, tileset, x, y
    const groundLayer = tileMap.createLayer("Ground", tileset, 0, 0);
    const worldLayer = tileMap.createLayer("World", tileset, 0, 0);
    //worldLayer.setCollisionByProperty({ ge_collide: true });

    this.player = this.add.sprite(
      this.spawn(4, 8),
      this.spawn(3, 0),
      "player"
    );
    this.dinosaur = this.physics.add.sprite(
      this.spawn(7, 12),
      this.spawn(7, 2),
      "dinosaur"
    );

    //this.player.setCollideWorldBounds(true);

    // check for collisions
    // this.physics.add.collider(this.player, worldLayer);
    // this.physics.add.collider(this.dinosaur, worldLayer);


    // GRID ENGINE

    const gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.player,
          //walkingAnimationMapping: 6,
          startPosition: { x: 4, y: 8 },
        },
        {
          id: "dinosaur",
          sprite: this.dinosaur,
          //walkingAnimationMapping: 6,
          startPosition: { x: 12, y: 8 },
        },
      ],
    };

    this.gridEngine.create(tileMap, gridEngineConfig);

    // CREATE UI
    this.playerTurnsUI = this.add.text(0, 0, 'Player turns: ' + this.playerTurns);



    if (this.debugMode) {
      this.drawGrid();
    }
    //this.gridEngine.moveRandomly("dinosaur", 200);
  }

  update() {
    // if i need to check for something every frame

  }
  surroundingPlayerTiles() {
    // let x = this.player.x;
    // let y = this.player.y;
  }

  setTextUI() {
    this.playerTurnsUI.setText('Player turns: ' + this.playerTurns);
  }

  endPlayerTurn() {
    console.log("Player turn over");
    this.enemyTurn();
  }

  enemyTurn() {
    let enemyTurnDone = false;
    // "AI"
    // check for collisions / if it was able to move

    //let randomMove = Math.floor(Math.random() * 4);
    this.randomEnemyMove();

    // loop every enemy array and make them run their turn
    // after all enemies are done with their moves set enemyTurnDone = true;
    enemyTurnDone = true;

    if (enemyTurnDone) {
      this.resetPlayerTurn();
    }
  }
  dinosaurAttackMelee() {
    // chance of critical attack? if critical, show ui text
    // play sound effect
    // remove health from player
    console.log("ATTACK");
  }
  dinosaurAttackRange() {
    // chance of critical attack? if critical, show ui text
    // play sound effect
    // remove health from player
    console.log("RANGE ATTACK");
  }
  dinosaurMove() {
    // make sure the enemy actually moves somewhere (and not hindered by obstacle)

    let randomNumber = this.getRandomInt(5);
    console.log("MOVING");

    switch (randomNumber) {
      case 0:
        this.gridEngine.move("dinosaur", "up");
        break;
      case 1:
        this.gridEngine.move("dinosaur", "down");
        break;
      case 2:
        this.gridEngine.move("dinosaur", "left");
        break;
      case 3:
        this.gridEngine.move("dinosaur", "right");
        break;
    }
  }

  randomEnemyMove() {
    let randomNum = this.getRandomInt(4)

    switch (randomNum) {
      case 0:
        this.dinosaurAttackMelee();
        break;
      case 1:
        this.dinosaurAttackRange();
        break;
      case 2:
        this.dinosaurMove();
        break;
      default:
        break;
    }

  }
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  resetPlayerTurn() {
    this.playerTurn = true;
    this.playerTurns = this.playerTurnsMax
    this.setTextUI();
  }



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
      this.playerMoveFinished();
    }

  }
  whenKeyRIGHTPressed() {
    if (this.playerTurn && this.playerTurns != 0) {
      this.gridEngine.move("player", "right");
      this.playerMoveFinished();
    }
  }

  playerMoveFinished() {
    this.playerTurns--;
    this.setTextUI();
    if (this.playerTurns == 0) {
      this.endPlayerTurn();
    }
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
  whenKeyQPressed() {
    // do something
    var canMove = this.playerMoveFreely;

    if (canMove) this.playerMoveFreely = false;
    else this.playerMoveFreely = true;

    console.log(this.playerMoveFreely);
  }

  drawGrid() {
    // https://phaser.io/examples/v3/view/game-objects/shapes/grid
    var g1 = this.add.grid(128, 128, 256, 256, 16, 16, 0xff0000, 0.2);
  }

  spawn(gridPlacement, offset) {
    const gridSize = 16;
    const place = gridPlacement * gridSize - offset;
    return place;
  }
}
