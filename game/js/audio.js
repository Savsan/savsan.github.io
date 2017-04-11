class AudioPool {
    constructor(filePath, volume, maxSize, loop = false) {
        this.size = maxSize <= 0 ? 1 : maxSize;
        this.pool = [];
        this.currSound = 0;

        for (let i = 0; i < this.size; i++) {
            const audioEntity = new Audio(filePath);
            audioEntity.volume = volume;
            audioEntity.loop  = loop;
            audioEntity.load();
            this.pool[i] = audioEntity;
        }
    }

    setVolume(volume){
        if(typeof volume === 'number'){
            for(let i = 0; i < this.pool.length; i++) {
                this.pool[i].volume = volume;
            }
        }else{
            throw 'Passed parameter is not a number.';
        }
    }

    play(){
        let currentPlayTime = this.pool[this.currSound].currentTime;
        let isEnded = this.pool[this.currSound].ended;
        let isPaused = this.pool[this.currSound].paused;

        if (currentPlayTime == 0 || isEnded || isPaused) {
            this.pool[this.currSound].play();
        }
        this.currSound = (this.currSound + 1) % this.size;
    }

    pause(){
        let currentPlayTime = this.pool[this.currSound].currentTime;
        if (currentPlayTime != 0) {
            this.pool[this.currSound].pause();
        }
    }
}
