// https://photonstorm.github.io/phaser3-docs/

class SceneUI extends Phaser.Scene {
  constructor() {
    super({
      key: "sceneUI", active: true
    });
  }

  create() {
    this.uiEnabled = false;

    //  Check the Registry and hit our callback every time the 'score' value is updated
    if (this.uiEnabled) {
      this.registry.events.on('changedata', this.updateData, this);

      this.turnsText = this.add.text(10, 48, 'Turns: x', { font: '32px Arial', fill: '#000000' });
      this.healthText = this.add.text(10, 10, 'Health: x', { font: '32px Arial', fill: '#000000' });

    }
  }
  updateData(parent, key, data)
    {
      if (key === 'playerHealth' && this.uiEnabled) {
        this.healthText.setText('Health: ' + data);
      }
      else if (key === 'playerTurns' && this.uiEnabled) {
        this.turnsText.setText('Turns: ' + data);
      }
  }
}

