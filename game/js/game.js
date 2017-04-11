class Game {
    constructor(){
        // Get canvas........................................................
        this.canvas = document.getElementById('canvas');
        this.canvas.width = 930;
        this.canvas.height = 566;
        // Get context.......................................................
        this.ctx = this.canvas.getContext('2d');
        // Time && State.....................................................
        this.paused = false;
        this.pauseStartTime = 0;
        this.pausedICheckInterval = 200;
        this.framesTimeDifference = 0;
        this.lastTimeStamp = 0;
        this.score = 0;
        this.birdsScore = 0;
        this.starsScore = 0;
        this.level = 1;
        // Level time && play control
        this.timer = new Timer(1, this.nextLevel.bind(this));
        this.gameSceneStarted = false;
        // Last shoot time
        this.fireTime = Date.now();
        this.fireDelay = 100;
        // Stars show delay
        this.starTime = Date.now();
        this.starDelay = 5000;
        // Health show delay
        this.healthTime = Date.now();
        this.healthDelay = 72000;
        // FPS calculation
        this.lastAnimationFrameTime = 0;
        this.lastFpsUpdateTime = 0;
        this.fps = 0;
        // Translation offset, velocity, objects speed
        this.offset = 0;
        this.velocity = 140;
        this.skyOffset = 0;
        this.enemySpeed = 160;
        this.starSpeed = 250;
        this.healthSpeed = 320;
        this.bulletSpeed = 700;
        this.velocityAcceleration = 0.05;
        this.enemySpeedAcceleration = 0.08;
        this.lastVelocity = this.velocity;
        this.lastEnemySpeed = this.enemySpeed;
        // Player (Plane)
        this.plane = {
            pos: [100, this.canvas.height / 2],
            velocity: 200,
            life: 3,
            damaged: false,
            sprite: new Sprite('img/plane-sprite.png', [0, 0], [73, 74], 12, [0, 1, 2, 3])
        }
        // UI elements.......................................................
        this.scoreElement = document.getElementById('score');
        this.scoreElement.innerHTML = 0;
        this.playElement = document.getElementById('play');
        this.playElement.style.display = 'none';
        this.pauseElement = document.getElementById('pause');
        this.lifeElement = document.getElementById('life-count');
        this.lifeElement.innerHTML = this.plane.life;
        this.gameOverSceneElement = document.getElementById('game-over-scene');
        this.levelScoreElement = document.getElementById('level-score');
        this.scoreBlockElement = document.getElementById('score-block');
        this.birdsScoreElement = document.getElementById('birds-score');
        this.starsScoreElement = document.getElementById('stars-score');
        this.totalScoreElement = document.getElementById('total-score');
        this.tryAgainButtonElement = document.getElementById('try-again-button');
        // Controls..........................................................
        this.keyboard = new Keyboard();
        // Resources && entities.............................................
        this.sky = new Image();
        // Enemies, effects, weapon
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        // Useful objects of the game
        this.stars = [];
        this.health = [];
        // Game audio
        this.starAudio = new AudioPool('audio/star-spell.wav', 0.3, 10);
        this.shotAudio = new AudioPool('audio/plane-shot.wav', 0.14, 12);
        this.planeExplosionAudio = new AudioPool('audio/plane-explode.wav', 0.45, 1);
        this.planeEngineAudio = new AudioPool('audio/plane-engine.ogg', 0.3, 1, true);
        this.birdDeathAudio = new AudioPool('audio/bird-death.flac', 0.25, 50);
        this.backgroundAudio = new AudioPool('audio/back-melody.ogg', 1, 1, true);
        this.backgroundAudio.play();
        // Check if resources were loaded
        this.resources = new Resources();
        this.resources.load([
            'img/sky-bg.jpg',
            'img/plane-sprite.png',
            'img/plane-damaged-sprite.png',
            'img/red-bird.png',
            'img/plane-explosion.png',
            'img/bird-explosion.png',
            'img/bullet.png',
            'img/yellow-star-sprite.png',
            'img/health-sprite.png'
        ]);
        // Toasts............................................................
        this.toast = document.getElementById('toast');
        this.defaultToastTime = 3000;
        this.startScene();
    }

    startScene(){
        let startScene = document.getElementById('start-scene');
        let startButton = document.getElementById('start-button');
        startScene.style.visibility = 'visible';
        startButton.style.display = 'inline-block';

        startButton.addEventListener('click', (event) => {
            this.resources.onReady(this.init());
            startScene.style.opacity = 0;
            startButton.style.opacity = 0;
            setTimeout(() => {
                startScene.style.visibility = 'hidden';
                startButton.style.display = 'none';
            }, 300);
        });
    }

    gameScene(){
        this.gameSceneStarted = true;
        // Call next level method when time will out
        this.timer.countTime();
        if(!this.paused){
            this.planeEngineAudio.play();
        }

        if(this.velocity < 450){
            setTimeout(() => {
                //this.velocity += this.velocityAcceleration;
                this.enemySpeed += this.enemySpeedAcceleration;
            }, 1000);
        }
    }

    nextLevel(){
        this.level++;
        this.showToast(`Level ${this.level}`, 2000);

        //this.velocity = this.lastVelocity;
        this.enemySpeed = this.lastEnemySpeed;

        //this.velocity += 5;
        this.enemySpeed += 10;

       // this.lastVelocity = this.velocity;
        this.lastEnemySpeed = this.enemySpeed;

       // this.velocityAcceleration += 0.01;
        this.enemySpeedAcceleration += 0.01;
    }

    gameOver(){
        this.levelScoreElement.innerHTML = this.level;
        this.birdsScoreElement.innerHTML = this.birdsScore;
        this.starsScoreElement.innerHTML = this.starsScore;
        this.totalScoreElement.innerHTML = this.score;
        this.planeEngineAudio.pause();

        setTimeout(() => {
            this.gameOverSceneElement.style.visibility = 'visible';
            this.gameOverSceneElement.style.opacity = 1;
            this.scoreBlockElement.style.display = 'inline-block';
            this.tryAgainButtonElement.style.display = 'inline-block';
        }, 1700);

        this.resetGameState();

        this.tryAgainButtonElement.addEventListener('click', (event) => {
            this.paused = false;
            setTimeout(() => {
                this.gameOverSceneElement.style.visibility = 'hidden';
                this.gameOverSceneElement.style.opacity = 0;
                this.tryAgainButtonElement.style.display = 'none';
                this.scoreBlockElement.style.display = 'none';
                this.lifeElement.innerHTML = this.plane.life;
                this.timer.reset();
                this.planeEngineAudio.play();
            }, 300);
        });
    }

    resetGameState(){
        this.paused = true;
        this.pauseStartTime = 0;
        this.pausedICheckInterval = 200;
        this.framesTimeDifference = 0;
        this.lastTimeStamp = 0;
        this.score = 0;
        this.scoreElement.innerHTML = 0;
        this.birdsScore = 0;
        this.starsScore = 0;
        this.level = 1;
        this.playElement.style.display = 'none';
        this.pauseElement.style = 'inline-block';
        // Level time control
        this.gameSceneStarted = false;
        this.velocityAcceleration = 0.05;
        this.enemySpeedAcceleration = 0.08;
        // Stars show delay
        this.starTime = Date.now();
        this.starDelay = 5000;
        // Health show delay
        this.healthTime = Date.now();
        // FPS calculation
        this.lastAnimationFrameTime = 0;
        this.lastFpsUpdateTime = 0;
        this.fps = 0;
        // Translation offset && velocity
        this.offset = 0;
        this.velocity = 50;
        this.skyOffset = 0;
        // Resources && entities
        this.enemies = [];
        this.enemySpeed = 70;
        this.bullets = [];
        this.bulletSpeed = 700;
        this.explosions = [];
        // Useful objects of the game
        this.stars = [];
        this.starSpeed = 100;
        this.plane.pos = [100, this.canvas.height / 2];
        this.plane.velocity = 200;
        this.plane.life = 3;
        this.plane.damaged = false;
    }

    // FPS && time difference calculation....................................
    calculateFps(now){
        // Calculate && write time difference between frames
        let currentTime = Date.now();
        this.framesTimeDifference = (currentTime - this.lastTimeStamp) / 1000;
        this.lastTimeStamp = currentTime;

        // Calculate FPS
        let fps = 1000 / (now - this.lastAnimationFrameTime);
        this.lastAnimationFrameTime = now;

        if (now - this.lastFpsUpdateTime > 1000) {
          this.lastFpsUpdateTime = now;
          //console.log(this.fpsElement.innerHTML)
          //this.fpsElement.innerHTML = `${fps.toFixed(0)} fps`;
        }

        this.fps = fps;
    }

    // OffSets..............................................................
    setSkyOffset(){
       let offset = this.skyOffset + this.velocity / this.fps;

       if (offset > 0 && offset < this.sky.width) {
          this.skyOffset = offset;
       } else {
          this.skyOffset = 0;
       }
    }

    // Main set offsets function
    setOffsets(){
      this.setSkyOffset();
    }

    // Draw GAME content.....................................................
    drawSky(){
      let skyWidth = this.sky.width;

      this.ctx.translate(-this.skyOffset, 0);
      this.ctx.drawImage(this.sky, 0, 0);
      this.ctx.drawImage(this.sky, skyWidth, 0);
      this.ctx.translate(this.skyOffset, 0);
    }

    drawPlane(){
      let time = this.framesTimeDifference;

      this.plane.sprite.update(time);

      if(!this.plane.damaged && this.plane.sprite.done){
          this.plane.damaged = false;
          this.plane.sprite = new Sprite('img/plane-sprite.png', [0, 0], [73, 74], 12, [0, 1, 2, 3]);
      }

      this.renderEntity(this.plane);
    }

    addBullets(x,y){
        this.bullets.push({
            pos: [x, y],
            sprite: new Sprite('img/bullet.png', [0, 0], [16, 6], 0, [0])
        });
    }

    drawBullets(){
        let time = this.framesTimeDifference;
        let fps = this.fps;
        // Update
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            bullet.sprite.update(time);
            bullet.pos[0] += this.bulletSpeed / fps;

            // Remove bullet if it out of the screen
            if (bullet.pos[1] < 0 || bullet.pos[1] > this.canvas.height ||
                bullet.pos[0] > this.canvas.width + this.offset) {
                this.bullets.splice(i, 1);
                i--;
            }
        }

        this.renderEntities(this.bullets);
    }

    drawStars(){
        let time = this.framesTimeDifference;
        let fps = this.fps;

        // Stars move && animation
        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].pos[0] -= this.starSpeed / fps;
            this.stars[i].sprite.update(time);

            // Remove stars when it out of the screen
            if (this.stars[i].pos[0] + this.stars[i].sprite.size[0] < this.offset) {
                this.stars.splice(i, 1);
                i--;
            }
        }
        // Add new stars
        if (Date.now() - this.starTime > this.starDelay) {
            this.stars.push({
                pos: [this.canvas.width + this.offset, Math.random() * (this.canvas.height - 50)],
                sprite: new Sprite('img/yellow-star-sprite.png', [0, 0], [50.57, 48], 12, [0, 1, 2, 3, 4, 5, 6])
            });
            this.starTime = Date.now();
        }
        // Render stars
        this.renderEntities(this.stars);
    }

    drawHealth(){
        let time = this.framesTimeDifference;
        let fps = this.fps;

        // Health move && animation
        for (let i = 0; i < this.health.length; i++) {
            this.health[i].pos[0] -= this.healthSpeed / fps;
            this.health[i].sprite.update(time);

            // Remove health when it out of the screen
            if (this.health[i].pos[0] + this.health[i].sprite.size[0] < this.offset) {
                this.health.splice(i, 1);
                i--;
            }
        }

        // Add new health
        if (Date.now() - this.healthTime > this.healthDelay) {
            this.health.push({
                pos: [this.canvas.width + this.offset, Math.random() * (this.canvas.height - 50)],
                sprite: new Sprite('img/health-sprite.png', [0, 0], [54, 48], 16, [0, 1, 2, 3, 4, 5, 6, 7])
            });
            this.healthTime = Date.now();
        }
        // Render health
        this.renderEntities(this.health);
    }

    drawEnemies(){
        let time = this.framesTimeDifference;
        let fps = this.fps;

        // Enemies move && animation
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].pos[0] -= this.enemySpeed / fps;
            this.enemies[i].sprite.update(time);

            // Remove enemies when it out of the screen
            if (this.enemies[i].pos[0] + this.enemies[i].sprite.size[0] < this.offset) {
                this.enemies.splice(i, 1);
                i--;
            }
        }
        // Create enemies
        if (Math.random() < 0.02 * this.level) {
            this.enemies.push({
                pos: [this.canvas.width + this.offset, Math.random() * (this.canvas.height + 50)],
                sprite: new Sprite('img/red-bird.png', [0, 0], [43, 30], 12, [0, 1, 2, 3])
            });
        }
        // Render enemies
        this.renderEntities(this.enemies);
    }

    addBirdExplosion(x,y){
        this.explosions.push({
            pos: [x, y],
            sprite: new Sprite('img/bird-explosion.png',
            [0, 0], [42, 40], 12, [0, 1, 2, 3], null, true)
        });
    }

    drawExplosions(){
        let time = this.framesTimeDifference;

        for (let i = 0; i < this.explosions.length; i++){
            this.explosions[i].sprite.update(time);

            if(this.explosions[i].sprite.done){
                this.explosions.splice(i, 1);
                i--;
            }
        }

        this.renderEntities(this.explosions);
    }

    // Rendering
    renderEntity(entity){
        this.ctx.save();
        this.ctx.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(this.ctx);
        this.ctx.restore();
    }

    renderEntities(array){
        for(let i = 0; i < array.length; i++){
            this.renderEntity(array[i]);
        }
    }

    // Main draw function
    draw(){
      this.setOffsets();
      this.drawSky();
      this.drawPlane();
      this.drawEnemies();
      this.drawExplosions();
      this.drawBullets();
      this.drawStars();
      this.drawHealth();
    }

    // Collisions cheking....................................................
    collides(x, y, r, b, x2, y2, r2, b2){
        return !(r <= x2 || x > r2 || b <= y2 || y > b2);
    }

    boxCollides(pos, size, pos2, size2){
        return this.collides(pos[0], pos[1], pos[0] + size[0], pos[1] + size[1],
                      pos2[0], pos2[1], pos2[0] + size2[0], pos2[1] + size2[1]);
    }

    checkCollisions(){
        // Start checking of collisions
        for (let i = 0; i < this.enemies.length; i++) {
            const pos = this.enemies[i].pos;
            const size = this.enemies[i].sprite.size;
            // Collisions of plane and enemies
            if (this.boxCollides(pos, size, this.plane.pos, this.plane.sprite.size)) {
                this.plane.life--;
                this.lifeElement.innerHTML = this.plane.life;
                this.plane.damaged = true;
                this.birdDeathAudio.play();
                this.addBirdExplosion(pos[0], pos[1]);
                if(this.plane.life == 1){
                    this.plane.sprite = new Sprite('img/plane-damaged-sprite.png', [0, 0], [73, 74], 12, [0, 1, 2, 3]);
                }
                    // Delete an enemy
                    this.enemies.splice(i, 1);
                    i--;
                if (this.plane.life === 0) {
                    this.planeExplosionAudio.play();
                    this.plane.sprite = new Sprite('img/plane-explosion.png', [0, 0], [100, 100], 26, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 'horizontal', true);
                    setTimeout(() => {
                        this.paused = true;
                        this.showToast('GAME OVER', 1500);
                        this.gameOver();
                  }, 600);
                }
            }
            // Collisions of bullets and enemies
            for (let j = 0; j < this.bullets.length; j++) {
                const bulletPos = this.bullets[j].pos;
                const bulletSize = this.bullets[j].sprite.size;

                if (this.boxCollides(pos, size, bulletPos, bulletSize)) {
                    // Remove the enemy
                    this.enemies.splice(i, 1);
                    i--;

                    // Add score
                    this.score += 10;
                    this.birdsScore++;
                    this.scoreElement.innerHTML = this.score;
                    this.birdDeathAudio.play();
                    this.addBirdExplosion(pos[0], pos[1]);

                    // Remove bullet
                    this.bullets.splice(j, 1);
                    break;
                }
            }
        }
        // Collisions of stars
        for(let s = 0; s < this.stars.length; s++){
            const starPos = this.stars[s].pos;
            const starSize = this.stars[s].sprite.size;

            if (this.boxCollides(starPos, starSize, this.plane.pos, this.plane.sprite.size)) {
                // Delete star
                this.starAudio.play();
                this.stars.splice(s, 1);
                s--;
                // Add score
                this.score += 100;
                this.starsScore++;
                this.scoreElement.innerHTML = this.score;
            }
        }
        // Collisions of hearts of health
        for(let h = 0; h < this.health.length; h++){
            const healthPos = this.health[h].pos;
            const healthSize = this.health[h].sprite.size;

            if (this.boxCollides(healthPos, healthSize, this.plane.pos, this.plane.sprite.size)) {
                this.starAudio.play();
                // Delete star
                this.health.splice(h, 1);
                h--;
                // Add life
                this.plane.life++;
                this.lifeElement.innerHTML = this.plane.life;
                if(this.plane.life === 2){
                    this.plane.sprite = new Sprite('img/plane-sprite.png', [0, 0], [73, 74], 12, [0, 1, 2, 3]);
                }
            }
        }
    }

    // Main function of update of state
    update(now){
      this.calculateFps(now);
      this.keyboardHandler();
      this.draw();

      this.checkCollisions();
      this.gameScene();
    }

    // Toasts................................................................
    showToast(message, time) {
      time = time || this.defaultToastTime;

      this.toast.style.visibility = 'visible';
      this.toast.style.font = '128px fantasy';
      this.toast.innerHTML = message;
      // After showing toast
      setTimeout( (e) => {
         toast.style.opacity = 1.0;
      }, 50);
      // After CSS transition
      setTimeout( (e) => {
         toast.style.opacity = 0;
         // Before ending of css animation
         setTimeout( (e) => {
            toast.style.visibility = 'hidden';
         }, 480);
      }, time);
    }

    // Input handling........................................................
    keyboardHandler(){
        let fps = this.fps;
        let pixels = this.plane.velocity / fps;
        const input = this.keyboard;

        if (input.isDown('DOWN') || input.isDown('s')) {
            this.plane.pos[1] += pixels;
            if (this.plane.pos[1] > this.canvas.height - this.plane.sprite.size[1]) {
                this.plane.pos[1] = this.canvas.height - this.plane.sprite.size[1];
            }
        }

        if (input.isDown('UP') || input.isDown('w')) {
            this.plane.pos[1] -= pixels;
            if (this.plane.pos[1] < 0) {
                this.plane.pos[1] = 0;
            }
        }

        if (input.isDown('LEFT') || input.isDown('a')) {
            this.plane.pos[0] -= pixels;
            if (this.plane.pos[0] < this.offset) {
                this.plane.pos[0] = this.offset;
            }
        }

        if (input.isDown('RIGHT') || input.isDown('d')) {
            this.plane.pos[0] += pixels;
            if (this.plane.pos[0] > this.offset + this.canvas.width - this.plane.sprite.size[0]) {
                this.plane.pos[0] = this.offset + this.canvas.width - this.plane.sprite.size[0];
            }
        }

        if (input.isDown('SPACE')) {
            // Fire delay
            if(Date.now() - this.fireTime > this.fireDelay){
                const x = this.plane.pos[0] + this.plane.sprite.size[0] / 1.5;
                const y = this.plane.pos[1] + this.plane.sprite.size[1] / 2;

                this.addBullets(x,y);
                this.shotAudio.play();
                this.fireTime = Date.now();
            }
        }
    }

    // Set && unset pause
    changePause(){
        let time = +new Date();
        this.paused = !this.paused;

        if (this.paused) {
           this.pauseStartTime = time;
           this.timer.setPause();
           this.pauseElement.style.display = 'none';
           this.playElement.style.display = 'inline-block';
           this.planeEngineAudio.pause();
           this.backgroundAudio.pause();
        }else{
           this.lastAnimationFrameTime += (time - this.pauseStartTime);
           this.pauseElement.style.display = 'inline-block';
           this.playElement.style.display = 'none';
           this.planeEngineAudio.play();
           this.backgroundAudio.play();
        }
    }

    // Game state && cycle...................................................
    animate(now){
        if(this.paused){
            setTimeout( () => {
                requestAnimationFrame(this.animate.bind(this));
             }, this.pausedICheckInterval);
        }else if(!this.paused){
            this.update(now);
            requestAnimationFrame(this.animate.bind(this));
        }
    }

    startGame(){
      this.showToast('Good Luck!');
      requestAnimationFrame(this.animate.bind(this));
    }

    init(){
        this.sky.src = 'img/sky-bg.jpg';
        this.startGame();
    }
}
