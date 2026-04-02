// reward.js - Final Vault & Rewards
class RewardSystem {
    constructor() {
        this.correctPassword = "DANDADAN-GHOSTHUNTER-WOLFGIRL";
        this.videoUrl = "assets/hehe.mp4";
    }

    attemptCrack() {
        const input = document.getElementById('vault-input').value.trim().toUpperCase();
        const result = document.getElementById('crack-result');

        if (input === this.correctPassword) {
            result.style.color = '#0f0';
            result.innerText = "ACCESS GRANTED. VAULT OPENING...";
            setTimeout(() => {
                this.showRewards();
            }, 1000);
        } else {
            result.style.color = '#f00';
            result.innerText = "ACCESS DENIED. INCORRECT PASSWORD.";
        }
    }

    showRewards() {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById('reward-screen').classList.add('active');
        window.bgManager.changeTheme('menu');

        // Show the pre-message first
        document.getElementById('reward-pre-msg').style.display = 'flex';
        document.getElementById('reward-real-content').style.display = 'none';

        document.getElementById('final-pw-display').innerText = this.correctPassword;
    }

    showFinalVideo() {
        document.getElementById('reward-pre-msg').style.display = 'none';
        document.getElementById('reward-real-content').style.display = 'block';

        const video = document.getElementById('reward-video');
        video.src = this.videoUrl;
        video.load();

        // When video ends, show the heart-felt message
        video.onended = () => {
            document.getElementById('final-birthday-msg').style.display = 'flex';
        };

        video.play();
    }

    toggleStats() {
        const display = document.getElementById('stats-display');
        const grid = document.getElementById('stats-summary-grid');
        const btn = document.getElementById('show-stats-btn');

        if (display.style.display === 'none') {
            display.style.display = 'block';
            btn.innerText = '🔼 HIDE JOURNEY STATS';
            grid.innerHTML = this.getStatsHtml();
        } else {
            display.style.display = 'none';
            btn.innerText = '📈 VIEW MY JOURNEY STATS';
        }
    }

    getStatsHtml() {
        const stats = JSON.parse(localStorage.getItem('realm_analytics'));
        if (!stats) return '<p>No data recorded.</p>';

        let html = '';
        for (let level in stats) {
            html += `<div class="stats-col"><h4>REALM 0${level}</h4>`;
            stats[level].forEach(s => {
                const time = parseFloat(s.time);
                const timeStr = time > 60 ? `${Math.floor(time / 60)}m ${Math.floor(time % 60)}s` : `${time.toFixed(0)}s`;
                html += `<div class="stats-row"><span>Q${s.q}</span> <span>${timeStr}</span></div>`;
            });
            html += `</div>`;
        }
        return html;
    }

    copyStats() {
        const stats = JSON.parse(localStorage.getItem('realm_analytics'));
        if (!stats) return;

        let text = "🏆 REALM-UP PERFORMANCE REPORT 🏆\n\n";
        for (let level in stats) {
            text += `REALM 0${level}:\n`;
            stats[level].forEach(s => {
                const time = parseFloat(s.time);
                const timeStr = time > 60 ? `${Math.floor(time / 60)}m ${Math.floor(time % 60)}s` : `${time.toFixed(0)}s`;
                text += `  Quest ${s.q}: ${timeStr}\n`;
            });
            text += "\n";
        }

        navigator.clipboard.writeText(text).then(() => {
            alert("Stats copied to clipboard! Paste it to your favorite person. 🫂💖");
        });
    }

    showStats() {
        const stats = JSON.parse(localStorage.getItem('realm_analytics'));
        if (!stats) {
            console.log("No analytics data found yet.");
            return;
        }

        console.log("%c 🏆 REALM-UP PERFORMANCE REPORT 🏆 ", "background: #222; color: #ff0080; font-size: 20px; font-weight: bold; padding: 10px;");

        for (let level in stats) {
            console.log(`%c REALM 0${level} `, "background: #0f0; color: #000; font-weight: bold;");
            stats[level].forEach(s => {
                const mins = Math.floor(s.time / 60);
                const secs = (s.time % 60).toFixed(0);
                const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                console.log(`Q${s.q}: ${timeStr}`);
            });
        }
    }
}

window.reward = new RewardSystem();
