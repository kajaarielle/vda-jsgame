var config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    backgroundColor: "#0055aa",
    scene: [Scene1, SceneUI],
    width: 160,
    height: 128,
    zoom: 4,
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }, // no gravity
      },
    },
    plugins: {
      scene: [
        {
          key: "gridEngine",
          plugin: GridEngine,
          mapping: "gridEngine",
        },
      ],
    },
  };
  
  var game = new Phaser.Game(config);
  