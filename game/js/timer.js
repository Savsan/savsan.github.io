class Timer {
    constructor(minutes = 3, callBack){
        this.minutes = minutes;
        this.callBack = callBack;
        this.timeCounter = 0;
        this.startTime = 0;
        this.pauseStartTime = 0;
        this.timerPaused = false;
        this.timerPauseDifference = 0;
        this.leftTime = 0;

        this.minutesElement = document.getElementById('minutes');
        if(this.minutes >= 0 && this.minutes < 10){
            this.minutesElement.innerHTML = `0${this.minutes}`;
        }else{
            this.minutesElement.innerHTML = `${this.minutes}`;
        }
        this.secondsElement = document.getElementById('seconds');
        this.secondsElement.innerHTML = '00';
    }

    countTime(){
        let currentTime = new Date();
        let copyOfTimeCounter = 0;

        if(this.timeCounter === 0){
            this.timeCounter = new Date();
            this.timeCounter.setHours(0, this.minutes, 0, 0);
            this.startTime = new Date();
        }

        if(this.timerPaused){
            this.timerPauseDifference += currentTime - this.pauseStartTime;
            this.unsetPause();
        }

        copyOfTimeCounter = this.timeCounter;
        setTimeout(() => {
            this.leftTime = new Date( (this.timeCounter - (currentTime - this.startTime) + this.timerPauseDifference) );

            this.minutesElement.innerHTML = `0${this.getMinutes()}`;

            if(this.getSeconds() > 9){
                this.secondsElement.innerHTML = this.getSeconds();
            }else{
                this.secondsElement.innerHTML = `0${this.getSeconds()}`;
            }

            if(this.getMinutes() === 59 && this.getSeconds() === 59){
                this.callBack();
                this.reset();
            }
        }, 100);
        this.timeCounter = copyOfTimeCounter;
    }

    getMinutes(){
        return this.leftTime.getMinutes();
    }

    getSeconds(){
        return this.leftTime.getSeconds();
    }

    setMinutes(minutes){
        if(typeof minutes === 'number'){
            this.minutes = minutes;
        }else{
            throw 'Passed parameter is not a number.'
        }
    }

    setPause(){
        let time = +new Date();
        this.pauseStartTime = time;
        if(!this.timerPaused){
            this.timerPaused = !this.timerPaused;
        }
    }

    unsetPause(){
        if(this.timerPaused){
            this.timerPaused = !this.timerPaused;
        }
    }

    onTimeOut(callBack){
        if(typeof callBack === 'function'){
            this.callBack = callBack;
        }else{
            throw 'Passed parameter is not a function.';
        }
    }

    reset(){
        this.timeCounter = 0;
        this.startTime = 0;
        this.timerPaused = false;
        this.timerPauseDifference = 0;
        this.leftTime = 0;
    }
}
