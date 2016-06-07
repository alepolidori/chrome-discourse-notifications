var util = new function () {
    'use strict';

    var that = this;

    this.ID = 'util';
    this.audio = new Audio();

    this.playSound = function (audioFile) {
        try {
            this.audio.src = audioFile;
            this.audio.play();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.playNotificationSound = function () {
        try {
            this.playSound('../sounds/notify.mp3');
        } catch (err) {
            console.error(err.stack);
        }
    };
};
