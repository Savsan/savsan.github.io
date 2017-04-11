// Play the game when window will have loaded
window.addEventListener('load', function initGame(event){
    event = event || window.event;
    window.game = new Game();
});

// Set pause if game on blur
window.addEventListener('blur', function setPause(event){
    event = event || window.event;
    if (!window.game.paused && window.game.gameSceneStarted){
        window.game.changePause();
    }
}, false);

let pauseButton = document.getElementById('play-control');
pauseButton.addEventListener('click', function changePauseButton(event){
    event = event || window.event;
    if (window.game.gameSceneStarted){
        window.game.changePause();
    }
});
