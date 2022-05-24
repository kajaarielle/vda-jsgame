// https://photonstorm.github.io/phaser3-docs/
const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

var content = `Phaser is a fast, free, and fun open source HTML5 game framework that offers WebGL and Canvas rendering across desktop and mobile web browsers. Games can be compiled to iOS, Android and native apps by using 3rd party tools. You can use JavaScript or TypeScript for development.`;

class SceneUI extends Phaser.Scene {
  constructor() {
    super({
      key: "sceneUI", active: true
    });
  }

  create() {
    this.textRect = this.add.rectangle(80, 104, 128, 32, 0x000000);
    const style = { font: "12px Arial", fill: "#fff", resolution: 32 };
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = 104;
    this.textDialogue = this.add.text(screenCenterX, screenCenterY, '', style).setOrigin(0.5);
    this.textRect.alpha = 0;
    
    this.numberTalkedTo = 0;
    
    // //  Check the Registry and hit our callback every time the 'score' value is updated
    this.registry.events.on('changedata', this.updateData, this);
  }

  updateData(parent, key, data) {
    if (key === 'playerHealth' && this.uiEnabled) {
      this.healthText.setText('Health: ' + data);
    }
    else if (key === 'playerTurns' && this.uiEnabled) {
      this.turnsText.setText('Turns: ' + data);
    }
    else if (key === 'textUI') {
      
      if (data == "closeUI") {
        // close ui
        this.textDialogue.alpha = 0; 
        this.textRect.alpha = 0;
        
      } else {
        // enable ui
        this.textDialogue.alpha = 1; 
        this.textRect.alpha = 1;

        this.textDialogue.text = this.getUIText();
        this.numberTalkedTo++;
      }
    }
  }

  getUIText() {
    switch (this.numberTalkedTo) {
      case 0:
        return "Hey!";
        break;
      case 1:
        return "Can you help me?";
        break;
      case 2:
        return "I lost my key!";
        break;
        case 2:
          return "I can't leave without it.";
          break;
      default:
        this.numberTalkedTo = 0;
        return "Go take a look around.";
        break;
    }
  }
}

