// https://photonstorm.github.io/phaser3-docs/

class Scene1 extends Phaser.Scene {
    constructor() {
      super({
        key: "scene1",
      });
    }
  
    preload() {
      // TILESET
      this.load.image(
        "tileSet",
        "images/tileset.png"
      );
      this.load.tilemapTiledJSON("map", "/tileMap.json");
  
      // CHARACTER
      this.load.spritesheet(
        "character",
        "images/character.png",
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
      this.playerTurns = 3;
      this.playerTurnsMax = 3;
      this.playerMoveFreely = true;
    }
  
    create() {
      console.log("Printing 'phaser.this': ", this);
  
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
      worldLayer.setCollisionByProperty({ ge_collide: true });
      
      this.character = this.physics.add.sprite(
        this.spawn(4, 8),
        this.spawn(3, 0),
        "character"
      );
      this.dinosaur = this.physics.add.sprite(
        this.spawn(7, 12),
        this.spawn(7, 2),
        "dinosaur"
      );
      
      // check for collisions
      this.physics.add.collider(this.character, worldLayer);
      this.physics.add.collider(this.dinosaur, worldLayer);
  
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyW.on("down", this.whenKeyWPressed, this);
  
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyS.on("down", this.whenKeySPressed, this);
  
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyA.on("down", this.whenKeyAPressed, this);
  
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyD.on("down", this.whenKeyDPressed, this);
  
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.keyQ.on("down", this.whenKeyQPressed, this);
      
      
      
      
      if (this.debugMode) {
        this.drawGrid();
      }
      //this.gridEngine.moveRandomly("dinosaur", 200);
    }
  
    update() {
      // if i need to check for something every frame
    }
  
    whenKeyWPressed() {
      if (this.playerMoveFreely) {
        //this.character.y = this.character.y - this.pixelSize;
        this.character.y = this.character.y - this.pixelSize;
      }
    }
    whenKeySPressed() {
      if (this.playerMoveFreely) {
        this.character.y = this.character.y + this.pixelSize;
      }
    }
    whenKeyAPressed() {
      if (this.playerMoveFreely) {
        this.character.x = this.character.x - this.pixelSize;
        //this.gridEngine.move("character", "left");
        this.character.flipX = false;
      }
    }
    whenKeyDPressed() {
      if (this.playerMoveFreely) {
        this.character.x = this.character.x + this.pixelSize;
        //this.gridEngine.move("character", "right");
        this.character.flipX = true;
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
  
    afterPlayerAction() {
      this.playerTurns - 1;
      console.log(this.playerTurns);
      if (this.playerTurns == 0) {
        //this.randomEnemyTurn();
      }
    }
  
    randomEnemyTurn() {
      // if this.playerTurns == 0
      // do one of x actions
  
      this.playerTurns = this.playerTurnsMax;
      console.log("Reset turns");
    }
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
  