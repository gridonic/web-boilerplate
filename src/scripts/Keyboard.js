export default class Keyboard {
    constructor({
        keepAlive = 1500
    } = {}) {
        this._sequences = {};
        this._currentRun = '';
        this._lastPress = null;

        this.keepAlive = keepAlive;

        window.addEventListener('keypress', (e) => {
            let key = e.which || e.keyCode || 0;
            let now = Date.now();

            // Clear last run
            if (now - this._lastPress > this.keepAlive) {
                this._currentRun = '';
            }

            this._currentRun += String.fromCharCode(key);
            this._lastPress = now;

            if (this._sequences[this._currentRun]) {
                this._sequences[this._currentRun].forEach((cb) => cb());
            }

        });
    }

    register(sequence, callback) {

        if (this._sequences[sequence] === undefined) {
            this._sequences[sequence] = [];
        }

        this._sequences[sequence].push(callback);

        return this;
    }
}
