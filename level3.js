// level3.js - Realm 03 Silhouette Guesser
class Level3 {
    constructor() {
        this.container = document.getElementById('level3-content');
        this.characters = [
            {
                id: 1, name: "Erika", fullName: "Erika Shinohara",
                shadow: "assets/shadows/erika_shinohara.png",
                full: "assets/images/erika_shinohara .jpg"
            },
            {
                id: 2, name: "Kyouya", fullName: "Kyouya Sata",
                shadow: "assets/shadows/kyouya_sata.png",
                full: "assets/images/kyouya_sata .jpg"
            },
            {
                id: 3, name: "Takeru", fullName: "Takeru Hibiya",
                shadow: "assets/shadows/takeru_hibiya.jpg",
                full: "assets/images/takeru_hibiya .jpg"
            },
            {
                id: 4, name: "Ayumi", fullName: "Ayumi Sanda",
                shadow: "assets/shadows/ayumi_sanda.png",
                full: "assets/images/ayumi_sanda.jpg"
            },
            {
                id: 5, name: "Reika", fullName: "Reika Sata",
                shadow: "assets/shadows/reika_sata.png",
                full: "assets/images/reika_sata.jpg"
            }
        ];
        this.currentQ = 0;
        this.score = 0;
    }

    init() {
        this.currentQ = 0;
        this.score = 0;
        this.render();
    }

    render() {
        if (this.currentQ >= this.characters.length) {
            this.finish();
            return;
        }

        const char = this.characters[this.currentQ];
        document.getElementById('l3-score-hdr').innerText = 'Shadow: ' + (this.currentQ + 1) + ' / ' + this.characters.length;

        let html = '<div class="l3-puzzle-box" style="align-items: center;">' +
            '<p class="puzzle-desc">Who is this character? Type their first or last name.</p>' +
            '<div class="silhouette-card">' +
            '<img src="' + char.shadow + '" id="l3-shadow-img" class="silhouette-img" alt="Character" onerror="this.src=\'https://via.placeholder.com/250/FFFFFF/000000/?text=Missing+Image\'" />' +
            '<input type="text" id="l3-input" class="game-input" style="color: black; border: 2px solid #ff4d6d; background: white; margin-top: 10px; width: 90%; text-align: center;" placeholder="Enter Name..." autocomplete="off" />' +
            '<button class="btn btn-primary" style="width: 90%; font-weight: bold; padding: 12px;" onclick="window.level3.checkAnswer()">GUESS SHADOW</button>' +
            '</div>' +
            '<div id="l3-feedback" class="feedback-msg"></div></div>';

        this.container.innerHTML = html;

        // Auto-focus input and allow Enter key submission
        setTimeout(() => {
            const input = document.getElementById('l3-input');
            if (input) {
                input.focus();
                input.addEventListener("keypress", function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        window.level3.checkAnswer();
                    }
                });
            }
        }, 100);
    }

    checkAnswer() {
        const char = this.characters[this.currentQ];
        const fb = document.getElementById('l3-feedback');
        const img = document.getElementById('l3-shadow-img');
        const inputEl = document.getElementById('l3-input');

        if (fb.innerText !== "") return; // Prevent multiple clicks

        const inputStr = inputEl.value.trim().toLowerCase();
        // Check if the input is a valid substring of the full name, ensuring it's longer than 3 chars for safety
        const isCorrect = char.fullName.toLowerCase().includes(inputStr) && inputStr.length >= 3;

        inputEl.disabled = true;

        if (isCorrect) {
            this.score++;
            fb.style.color = '#0f0';
            fb.innerText = "CORRECT! It's " + char.fullName;

            // SWAP TO FULL IMAGE
            img.src = char.full;
            img.classList.add('revealed');

            this.currentQ++;
        } else {
            fb.style.color = '#f00';
            fb.innerText = "WRONG! The shadow vanishes...";
            this.currentQ = 0; // Reset progress
            this.score = 0;
        }

        setTimeout(() => {
            this.render();
        }, 2000); // 2 second pause to digest outcome/see revealed image
    }

    finish() {
        if (this.score === this.characters.length) {
            const fragment = "WOLFGIRL";
            this.container.innerHTML = '<div class="l3-puzzle-box" style="align-items: center;">' +
                '<h2 style="color:#0f0">REALM 03 CONQUERED</h2>' +
                '<p>The final secret lies in the title of this Anime.</p>' +
                '</div>';
            setTimeout(() => {
                window.game.completeLevel(3, fragment);
                window.reward.showRewards();
            }, 1500);
        }
    }
}
window.level3 = new Level3();
