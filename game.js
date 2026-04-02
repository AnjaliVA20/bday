class GameController {
    constructor() {
        this.progress = {
            level1Cleared: false,
            level2Cleared: false,
            level3Cleared: false
        };
        this.fragments = [];

        // Analytics
        this.timerStart = null;
        this.analytics = JSON.parse(localStorage.getItem('realm_analytics')) || { 1: [], 2: [], 3: [] };
    }

    startTimer() {
        if (this.timerStart) return; // Already running
        this.timerStart = Date.now();
    }

    recordTime(levelNum) {
        if (!this.timerStart) return;
        const elapsed = (Date.now() - this.timerStart) / 1000;
        this.analytics[levelNum].push({
            q: this.analytics[levelNum].length + 1,
            time: elapsed.toFixed(2) // in seconds
        });
        localStorage.setItem('realm_analytics', JSON.stringify(this.analytics));
        this.timerStart = null;
    }

    startGame() {
        this.switchScreen('home-screen', 'level-select');
        window.bgManager.changeTheme('menu');
        this.updateLevelSelectUI();
    }

    showLevelSelect() {
        // hide all level screens
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById('level-select').classList.add('active');
        window.bgManager.changeTheme('menu');
        this.updateLevelSelectUI();
    }

    enterLevel(levelNum) {
        if (levelNum === 2 && !this.progress.level1Cleared) return;
        if (levelNum === 3 && !this.progress.level2Cleared) return;

        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(`level${levelNum}-screen`).classList.add('active');

        window.bgManager.changeTheme(`level${levelNum}`);

        if (levelNum === 1) window.level1.init();
        if (levelNum === 2) window.level2.init();
        if (levelNum === 3) window.level3.init();
    }

    completeLevel(levelNum, fragmentWord) {
        this.fragments[levelNum - 1] = fragmentWord;
        this.progress[`level${levelNum}Cleared`] = true;
        this.showLevelSelect();
    }

    updateLevelSelectUI() {
        // Realm 01
        if (this.progress.level1Cleared) {
            document.getElementById('ws-1').style.display = 'none';
            document.getElementById('wb-1').style.display = 'block';
            document.getElementById('world-1').classList.add('cleared');
        } else {
            document.getElementById('ws-1').style.display = 'block';
            document.getElementById('wb-1').style.display = 'none';
            document.getElementById('world-1').classList.remove('cleared');
        }

        // Realm 02
        const w2 = document.getElementById('world-2');
        if (this.progress.level2Cleared) {
            document.getElementById('ws-2').style.display = 'none';
            document.getElementById('wb-2').style.display = 'block';
            w2.classList.add('cleared');
        } else {
            document.getElementById('wb-2').style.display = 'none';
            w2.classList.remove('cleared');

            // Lock/Unlock logic based on Level 1
            if (this.progress.level1Cleared) {
                w2.classList.remove('locked');
                w2.onclick = () => this.enterLevel(2);
                document.getElementById('ws-2').style.display = 'block';
                document.getElementById('ws-2').innerText = 'ENTER WORLD';
                w2.querySelector('.lock-overlay').style.display = 'none';
            } else {
                w2.classList.add('locked');
                w2.onclick = null;
                document.getElementById('ws-2').innerText = '🔒 LOCKED';
                w2.querySelector('.lock-overlay').style.display = 'flex';
            }
        }

        // Realm 03
        const w3 = document.getElementById('world-3');
        if (this.progress.level3Cleared) {
            document.getElementById('ws-3').style.display = 'none';
            document.getElementById('wb-3').style.display = 'block';
            w3.classList.add('cleared');
            document.getElementById('final-crack-btn').style.display = 'flex';
        } else {
            document.getElementById('wb-3').style.display = 'none';
            w3.classList.remove('cleared');
            document.getElementById('final-crack-btn').style.display = 'none';

            if (this.progress.level2Cleared) {
                w3.classList.remove('locked');
                w3.onclick = () => this.enterLevel(3);
                document.getElementById('ws-3').style.display = 'block';
                document.getElementById('ws-3').innerText = 'ENTER WORLD';
                w3.querySelector('.lock-overlay').style.display = 'none';
            } else {
                w3.classList.add('locked');
                w3.onclick = null;
                document.getElementById('ws-3').innerText = '🔒 LOCKED';
                w3.querySelector('.lock-overlay').style.display = 'flex';
            }
        }

        this.renderFragments();
    }

    resetGame() {
        localStorage.removeItem('realm_analytics');
        location.reload();
    }

    renderFragments() {
        const row = document.getElementById('fragments-row');
        row.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const f = document.createElement('div');
            f.className = 'fragment-box ' + (this.fragments[i] ? 'revealed' : '');
            f.textContent = this.fragments[i] ? 'REALM 0' + (i + 1) : '???';
            row.appendChild(f);
        }
    }

    showCodeCrack() {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById('code-crack-screen').classList.add('active');

        const fragsCrack = document.getElementById('frags-crack');
        fragsCrack.innerHTML = '';
        this.fragments.forEach((f, idx) => {
            const span = document.createElement('span');
            span.className = 'f-word';
            span.innerText = 'REALM 0' + (idx + 1); // Hide the actual name!
            fragsCrack.appendChild(span);
        });

        window.bgManager.changeTheme('level3'); // scary terminal vibe
    }

    switchScreen(fromId, toId) {
        document.getElementById(fromId).classList.remove('active');
        document.getElementById(toId).classList.add('active');
    }

    closeModal(e) {
        if (e && e.target.id !== 'card-modal' && e.target.className !== 'modal-close-btn') return;
        document.getElementById('card-modal').classList.remove('active');
    }
}

window.game = new GameController();
