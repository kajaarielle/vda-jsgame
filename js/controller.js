// class Controller {
//     constructor(scene) {
//         this.scene = scene;

//         // Basic move button
//         this.keyUp = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
//         this.keyUp.on("down", this.whenKeyUPPressed, this);
//         this.keyDown = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
//         this.keyDown.on("down", this.whenKeyDOWNPressed, this);
//         this.keyLeft = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
//         this.keyLeft.on("down", this.whenKeyLEFTPressed, this);
//         this.keyRight = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
//         this.keyRight.on("down", this.whenKeyRIGHTPressed, this);
        
//         // Select and cancel buttons
//         this.keySelect = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
//         this.keyCancel = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

//         // Enter key
//         this.keyEnter = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
//     }

//     /**
//      * Disable all keys
//      * @return {none}
//      */
//      disable() {
//         // Basic move button
//         this.keyUp.enabled = false;
//         this.keyDown.enabled = false;
//         this.keyLeft.enabled = false;
//         this.keyRight.enabled = false;

//         // Select and cancel buttons
//         this.keySelect.enabled = false;
//         this.keyCancel.enabled = false;

//         // Enter key
//         this.keyEnter.enabled = false;
//     }

//     /**
//      * Enable all keys
//      * @return {none}
//      */
//     enable() {
//         // Basic move button
//         this.keyUp.enabled = true;
//         this.keyDown.enabled = true;
//         this.keyLeft.enabled = true;
//         this.keyRight.enabled = true;

//         // Select and cancel buttons
//         this.keySelect.enabled = true;
//         this.keyCancel.enabled = true;

//         // Enter key
//         this.keyEnter.enabled = true;
//     }
// }