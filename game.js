class GameController {
    constructor() {
        this.progress = {
            level1Cleared: true,
            level2Cleared: true,
            level3Cleared: true
        };
        this.fragments = ["DANDADAN", "GHOSTHUNTER", "WOLFGIRL"];

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
        // Update Level 1 state
        if (this.progress.level1Cleared) {
            document.getElementById('ws-1').style.display = 'none';
            document.getElementById('wb-1').style.display = 'block';
            document.getElementById('world-1').classList.add('cleared');

            // Unlock Level 2
            const w2 = document.getElementById('world-2');
            w2.classList.remove('locked');
            w2.onclick = () => this.enterLevel(2);
            document.getElementById('ws-2').innerText = 'ENTER WORLD';
            document.getElementById('ws-2').style.color = 'var(--text)';
            w2.querySelector('.lock-overlay').style.display = 'none';
        }

        // Update Level 2 state
        if (this.progress.level2Cleared) {
            document.getElementById('ws-2').style.display = 'none';
            document.getElementById('wb-2').style.display = 'block';
            document.getElementById('world-2').classList.add('cleared');

            // Unlock Level 3
            const w3 = document.getElementById('world-3');
            w3.classList.remove('locked');
            w3.onclick = () => this.enterLevel(3);
            document.getElementById('ws-3').innerText = 'ENTER WORLD';
            document.getElementById('ws-3').style.color = 'var(--text)';
            w3.querySelector('.lock-overlay').style.display = 'none';
        }

        // Update Level 3 state
        if (this.progress.level3Cleared) {
            document.getElementById('ws-3').style.display = 'none';
            document.getElementById('wb-3').style.display = 'block';
            document.getElementById('world-3').classList.add('cleared');
            document.getElementById('final-crack-btn').style.display = 'flex';
        }

        this.renderFragments();
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
