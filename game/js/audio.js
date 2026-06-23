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
        } else {
            throw 'Passed parameter is not a number.';
        }
    }

    play(){
        let sound = this.pool[this.currSound];

        // Сбрасываем в начало, если звук уже играл или закончился
        if (sound.ended || !sound.paused) {
            sound.currentTime = 0;
        }

        // Обработка промиса для предотвращения ошибок автовоспроизведения
        let playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay prevented or audio error:", error);
            });
        }

        this.currSound = (this.currSound + 1) % this.size;
    }

    pause(){
        this.pool.forEach(sound => {
            if (!sound.paused) {
                sound.pause();
            }
        });
    }
}
