class Keyboard {
    constructor(){
        this.pressedKeys = {};

        document.addEventListener('keydown', (event) => {
            event = event || window.event;
            this.setKey(event, true);
        });

        document.addEventListener('keyup', (event) => {
            event = event || window.event;
            this.setKey(event, false);
        });
    }

    setKey(event, status) {
        const code = event.keyCode;
        let key;

        if(code === 37){
            key = 'LEFT';
        }else if(code === 38){
            key = 'UP';
        }else if(code === 39){
            key = 'RIGHT';
        }else if(code === 40){
            key = 'DOWN';
        }else if(code === 32){
            key = 'SPACE';
        }else{
          key = String.fromCharCode(code);
        }
        this.pressedKeys[key] = status;
    }

    isDown(key) {
        return this.pressedKeys[key.toUpperCase()];
    }
}
