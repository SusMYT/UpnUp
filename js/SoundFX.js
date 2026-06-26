var SFX = {
    ctx: null,

    init: function() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {}
    },

    play: function(type) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        switch(type) {
            case 'coin': this._coin(); break;
            case 'shield': this._shield(); break;
            case 'shieldBreak': this._shieldBreak(); break;
            case 'hit': this._hit(); break;
            case 'shoot': this._shoot(); break;
            case 'bossHit': this._bossHit(); break;
            case 'bossDefeat': this._bossDefeat(); break;
            case 'death': this._death(); break;
            case 'button': this._button(); break;
            case 'boost': this._boost(); break;
            case 'bossWarn': this._bossWarn(); break;
            case 'rainbow': this._rainbow(); break;
        }
    },

    _tone: function(freq, duration, type, vol, delay) {
        var ctx = this.ctx;
        var t = ctx.currentTime + (delay || 0);
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(vol || 0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duration);
    },

    _noise: function(duration, vol, delay) {
        var ctx = this.ctx;
        var t = ctx.currentTime + (delay || 0);
        var bufSize = ctx.sampleRate * duration;
        var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        var src = ctx.createBufferSource();
        src.buffer = buf;
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(vol || 0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(t);
    },

    _coin: function() {
        this._tone(880, 0.08, 'square', 0.12);
        this._tone(1320, 0.12, 'square', 0.12, 0.06);
    },

    _shield: function() {
        this._tone(440, 0.1, 'sine', 0.15);
        this._tone(660, 0.1, 'sine', 0.15, 0.08);
        this._tone(880, 0.15, 'sine', 0.12, 0.16);
        this._tone(1100, 0.2, 'sine', 0.08, 0.24);
    },

    _shieldBreak: function() {
        this._tone(600, 0.15, 'sawtooth', 0.12);
        this._tone(300, 0.2, 'sawtooth', 0.1, 0.1);
        this._noise(0.15, 0.08, 0.05);
    },

    _hit: function() {
        this._tone(200, 0.15, 'square', 0.12);
        this._tone(100, 0.2, 'square', 0.1, 0.08);
    },

    _shoot: function() {
        this._tone(1200, 0.06, 'square', 0.05);
        this._tone(800, 0.04, 'square', 0.04, 0.03);
    },

    _bossHit: function() {
        this._tone(300, 0.08, 'square', 0.1);
        this._tone(200, 0.1, 'sawtooth', 0.08, 0.05);
    },

    _bossDefeat: function() {
        this._tone(200, 0.15, 'square', 0.15);
        this._tone(300, 0.15, 'square', 0.15, 0.12);
        this._tone(400, 0.15, 'square', 0.15, 0.24);
        this._tone(600, 0.15, 'square', 0.15, 0.36);
        this._tone(800, 0.3, 'square', 0.12, 0.48);
        this._noise(0.3, 0.1, 0.1);
    },

    _death: function() {
        this._tone(400, 0.15, 'square', 0.15);
        this._tone(300, 0.15, 'square', 0.12, 0.12);
        this._tone(200, 0.2, 'square', 0.1, 0.24);
        this._tone(100, 0.4, 'sawtooth', 0.1, 0.36);
    },

    _button: function() {
        this._tone(660, 0.08, 'sine', 0.1);
    },

    _boost: function() {
        var ctx = this.ctx;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.6);
    },

    _rainbow: function() {
        this._tone(523, 0.12, 'sine', 0.12);
        this._tone(659, 0.12, 'sine', 0.12, 0.08);
        this._tone(784, 0.12, 'sine', 0.12, 0.16);
        this._tone(1047, 0.12, 'sine', 0.12, 0.24);
        this._tone(1319, 0.2, 'sine', 0.1, 0.32);
        this._tone(1568, 0.3, 'sine', 0.08, 0.4);
    },

    _bossWarn: function() {
        this._tone(150, 0.3, 'sawtooth', 0.12);
        this._tone(150, 0.3, 'sawtooth', 0.12, 0.4);
        this._tone(200, 0.5, 'sawtooth', 0.15, 0.8);
    }
};
