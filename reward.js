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
