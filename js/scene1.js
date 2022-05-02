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
    // this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    // this.keyUp.on("down", this.whenKeyUPPressed, this);
    // this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    // this.keyDown.on("down", this.whenKeyDOWNPressed, this);
    // this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    // this.keyLeft.on("down", this.whenKeyLEFTPressed, this);
    // this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    // this.keyRight.on("down", this.whenKeyRIGHTPressed, this);
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
    //#endregion
    
    //#region GRID ENGINE CONFIG
    const gridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.playerSprite,
          //walkingAnimationMapping: ,
          startPosition: { x: 1, y: 2 },
        },
      ],
    };

    this.gridEngine.create(tileMap, gridEngineConfig);
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
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.gridEngine.move("player", "left");
    } else if (cursors.right.isDown) {
      this.gridEngine.move("player", "right");
    } else if (cursors.up.isDown) {
      this.gridEngine.move("player", "up");
    } else if (cursors.down.isDown) {
      this.gridEngine.move("player", "down");
    }
  

    //#region TEST PLAYER MOVEMENT
    // var distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);

    // if (this.player.body.speed > 0) {
    //   console.log("The player is moving!");
    //   //distanceText.setText('Distance: ' + distance);

    //   //  4 is our distance tolerance, i.e. how close the source can get to the target
    //   //  before it is considered as being there. The faster it moves, the more tolerance is required.
    //   if (distance < 4) {
    //     this.player.body.reset(this.target.x, this.target.y);
    //     console.log("Player destination reached.");
    //   }
    // }

    // if i need to check for something every frame


    // var isUpDown = this.input.keyboard.checkDown(this.controller.keyUp)
    // if (isUpDown) {
    //   if (this.playerTurn && this.playerTurns != 0) {
    //     // move

    //     this.playerTurns--;
    //     this.setTextUI();
    //     if (this.playerTurns == 0) {
    //       this.endPlayerTurn();
    //     }
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
  surroundingPlayerTiles() {
    let x = this.player.x;
    let y = this.player.y;
  }

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

  endPlayerTurn() {
    console.log("Player turn over");
    this.enemyTurn();
  }

  enemyTurn() {
    var enemyTurnDone = false;
    // loop every enemy array and make them run their turn
    // after all enemies are done with their moves set enemyTurnDone = true;
    enemyTurnDone = true;

    if (enemyTurnDone) {
      this.resetPlayerTurn();
    }
  }

  resetPlayerTurn() {
    this.playerTurn = true;
    this.playerTurns = this.playerTurnsMax
    this.setTextUI();
  }

  //#region OLD CONTROLLER FUNCTIONS
  // whenKeyUPPressed() {
  //   if (this.playerTurn && this.playerTurns != 0) {
  //     // move player to target at set speed (px/s)
  //     this.target.x = this.player.x;
  //     this.physics.moveTo(this.player, this.target.x, this.player.y, this.moveSpeed);

  //     this.playerMoveFinished();
  //   }
  // }
  // whenKeyDOWNPressed() {
  //   if (this.playerTurn && this.playerTurns != 0) {
  //     // move
  //     this.playerMoveFinished();
  //   }

  // }
  // whenKeyLEFTPressed() {
  //   if (this.playerTurn && this.playerTurns != 0) {
  //     // move
  //     this.visibilityUI(this.testUI, false);

  //     this.playerMoveFinished();
  //   }

  // }
  // whenKeyRIGHTPressed() {
  //   if (this.playerTurn && this.playerTurns != 0) {
  //     // move
  //     this.playerMoveFinished();
  //   }
  // }
  //#endregion

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
