// level1.js - Realm 01 Hard Ciphers
class Level1 {
    constructor() {
        this.container = document.getElementById('level1-content');
        this.puzzles = [
            { text: "IAKOY", hint: "Read backwards from the end", answer: "YOKAI" },
            { text: "GFIYL", hint: "Mirrored dimension text (A=Z)", answer: "TURBO" },
            { text: "PBOML", hint: "Shifted backwards by 3", answer: "SERPO" },
            { text: "M4M4", hint: "Vowels are numbered sequentially", answer: "MOMO" },
            { text: "NOKARU", hint: "The last becomes the first", answer: "OKARUN" },
            { text: "NYVRA", hint: "Shifted exactly halfway (ROT13)", answer: "ALIEN" },
            { text: "--. .... --- ... -", hint: "Dots and dashes of the old era", answer: "GHOST" },
            { text: "HZWXJ", hint: "Caesar shifted forward by 5", answer: "CURSE" },
            { text: "D[OEOY", hint: "QWERTY keyboard shifted one right", answer: "SPIRIT" },
            { text: "15-3-3-21-12-20", hint: "Alphabet sequence position", answer: "OCCULT" }
        ];
        this.currentStep = 0;
        this.attempts = 3;
    }

    init() {
        this.currentStep = 0;
        this.attempts = 3;
        this.render();
    }

    render() {
        if (this.currentStep >= this.puzzles.length) {
            this.finish();
            return;
        }

        const p = this.puzzles[this.currentStep];
        this.container.innerHTML = '<div class="l1-puzzle-box">' +
            '<p class="puzzle-desc">Decode Alien Transmission [' + (this.currentStep + 1) + '/10]</p>' +
            '<div class="cipher-box">' +
            '<span class="cipher-text">' + p.text + '</span>' +
            '</div>' +
            '<p class="hint">Analysis: ' + p.hint + '</p>' +
            '<input type="text" id="l1-input" class="game-input" placeholder="ENTER DECODED WORD" autocomplete="off" />' +
            '<button class="btn btn-primary" onclick="window.level1.checkAnswer()">SUBMIT</button>' +
            '<div id="l1-feedback" class="feedback-msg"></div>' +
            '<div class="attempts-display" id="l1-attempts"></div>' +
            '</div>';

        this.updateAttempts();
    }

    checkAnswer() {
        const input = document.getElementById('l1-input').value.trim().toUpperCase();
        const fb = document.getElementById('l1-feedback');
        const p = this.puzzles[this.currentStep];

        if (input === p.answer) {
            fb.style.color = '#0f0';
            fb.innerText = "ACCESS GRANTED. DECRYPTED.";
            this.currentStep++;
            setTimeout(() => {
                this.render();
            }, 1000);
        } else {
            this.attempts--;
            this.updateAttempts();
            fb.style.color = '#f00';
            fb.innerText = "ACCESS DENIED.";
            if (this.attempts <= 0) {
                fb.innerText = "SYSTEM LOCKOUT. Try again.";
                setTimeout(() => {
                    this.init(); // reset
                }, 2000);
            }
        }
    }

    updateAttempts() {
        const el = document.getElementById('l1-attempts');
        if (el) el.innerText = '❤️ ' + this.attempts + ' attempts left';
    }

    finish() {
        const fragment = "DANDADAN";
        this.container.innerHTML = '<div class="l1-puzzle-box">' +
            '<h2 style="color:#0f0">REALM 01 DECRYPTED</h2>' +
            '<p>The first secret lies in the title of this Anime.</p>' +
            '</div>';
        setTimeout(() => {
            window.game.completeLevel(1, fragment);
        }, 1500);
    }
}
window.level1 = new Level1();
