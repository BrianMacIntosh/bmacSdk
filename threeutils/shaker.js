"use strict";
var THREE = require("three");
var noise_1 = require("../thirdparty/noise");
/**
 * Creates a threejs object that moves with Perlin noise jitter.
 */
var Shaker = (function () {
    function Shaker() {
        this.transform = new THREE.Object3D();
        this.contributions = [];
    }
    Shaker.prototype.shake = function (speed, amplitude, duration) {
        this.contributions.push(new ShakeData(speed, amplitude, duration));
    };
    Shaker.prototype.update = function (deltaSec) {
        this.transform.position.set(0, 0, this.transform.position.z);
        for (var i = this.contributions.length - 1; i >= 0; i--) {
            this.contributions[i].lifeTimeLeft -= deltaSec;
            if (this.contributions[i].lifeTimeLeft <= 0) {
                this.contributions.splice(i, 1);
            }
            else {
                this.contributions[i].contribute(this.transform.position);
            }
        }
    };
    return Shaker;
}());
exports.Shaker = Shaker;
var ShakeData = (function () {
    function ShakeData(frequency, amplitude, duration) {
        this.frequency = frequency;
        this.amplitude = amplitude;
        this.duration = duration;
        this.lifeTimeLeft = duration;
        this.ampRow = Math.random() * 1000;
        this.angleRow = Math.random() * 1000;
    }
    ShakeData.prototype.contribute = function (accumulator) {
        var lifeDecay = this.lifeTimeLeft / this.duration;
        var timePassed = (this.duration - this.lifeTimeLeft) * this.frequency;
        var amp = noise_1.noise.simplex2(this.ampRow, timePassed) * this.amplitude;
        var ang = noise_1.noise.simplex2(this.angleRow, timePassed) * Math.PI * 2;
        accumulator.x += Math.cos(ang) * amp * lifeDecay;
        accumulator.y += Math.sin(ang) * amp * lifeDecay;
        return accumulator;
    };
    return ShakeData;
}());
