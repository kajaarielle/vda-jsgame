var config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    backgroundColor: "#0055aa",
    scene: [Scene1],
    width: 256,
    height: 256,
    zoom: 3,
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }, // no gravity
      },
    },
  };
  
  var game = new Phaser.Game(config);
  