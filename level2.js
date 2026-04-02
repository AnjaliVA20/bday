// level2.js - Realm 02 Arrange puzzle
class Level2 {
    constructor() {
        this.container = document.getElementById('level2-content');
        this.phases = [
            {
                desc: "1. Investigation Protocol",
                items: [{ id: 1, name: "Interview Client" }, { id: 2, name: "Setup Equipment" }, { id: 3, name: "Provoke Spirits" }],
                targetOrder: [1, 2, 3]
            },
            {
                desc: "2. Escalation of a Haunting",
                items: [{ id: 1, name: "Cold Spots" }, { id: 2, name: "Moving Objects" }, { id: 3, name: "Demonic Possession" }],
                targetOrder: [1, 2, 3]
            },
            {
                desc: "3. Evolution of Evidence",
                items: [{ id: 1, name: "Orbs in Photos" }, { id: 2, name: "EVP Voice Recordings" }, { id: 3, name: "Physical Ectoplasm" }],
                targetOrder: [1, 2, 3]
            },
            {
                desc: "4. Proper Equipment Usage",
                items: [{ id: 1, name: "Flashlight" }, { id: 2, name: "EMF Reader" }, { id: 3, name: "Spirit Box" }],
                targetOrder: [1, 2, 3]
            },
            {
                desc: "5. Ghost Danger Levels",
                items: [{ id: 1, name: "Friendly Spirit" }, { id: 2, name: "Poltergeist" }, { id: 3, name: "Violent Demon" }],
                targetOrder: [1, 2, 3]
            }
        ];
        this.currentPhase = 0;
        this.currentSelection = [];
    }

    init() {
        this.currentPhase = 0;
        this.currentSelection = [];
        this.render();
    }

    render() {
        if (this.currentPhase >= this.phases.length) {
            this.finish();
            return;
        }

        const phase = this.phases[this.currentPhase];
        this.currentSelection = [];

        let html = '<div class="l2-puzzle-box">' +
            '<p class="puzzle-desc">' + phase.desc + ' — Select items in chronological order (' + (this.currentPhase + 1) + '/5)</p>' +
            '<div class="hxh-items-grid">';

        const shuffled = [...phase.items].sort(() => Math.random() - 0.5);
        shuffled.forEach(item => {
            html += '<div class="hxh-card" id="card-' + item.id + '" onclick="window.level2.selectCard(' + item.id + ')">' +
                '<div class="hxh-card-inner">' + item.name + '</div>' +
                '</div>';
        });

        html += '</div>' +
            '<div class="order-display" id="l2-order-display">Selection: </div>' +
            '<button class="btn btn-primary" onclick="window.level2.checkOrder()">VERIFY</button>' +
            '<button class="btn btn-secondary" onclick="window.level2.render()">RESET</button>' +
            '<div id="l2-feedback" class="feedback-msg"></div>' +
            '</div>';
        this.container.innerHTML = html;
    }

    selectCard(id) {
        if (this.currentSelection.includes(id)) return;
        this.currentSelection.push(id);
        const card = document.getElementById('card-' + id);
        card.classList.add('selected');

        const display = document.getElementById('l2-order-display');
        const phase = this.phases[this.currentPhase];
        display.innerText = "Selection: " + this.currentSelection.map(selId => phase.items.find(i => i.id === selId).name).join(" ➔ ");
    }

    checkOrder() {
        const fb = document.getElementById('l2-feedback');
        const phase = this.phases[this.currentPhase];

        if (this.currentSelection.length !== 3) {
            fb.style.color = '#ff0';
            fb.innerText = "Please select all 3 items.";
            return;
        }

        const isCorrect = this.currentSelection.every((val, index) => val === phase.targetOrder[index]);

        if (isCorrect) {
            fb.style.color = '#0f0';
            fb.innerText = "CORRECT CHRONOLOGY.";
            this.currentPhase++;
            setTimeout(() => {
                this.render();
            }, 1000);
        } else {
            fb.style.color = '#f00';
            fb.innerText = "INCORRECT HISTORY SEQUENCE.";
            setTimeout(() => {
                this.render(); // just reset current phase
            }, 1500);
        }
    }

    finish() {
        const fragment = "GHOSTHUNTER";
        this.container.innerHTML = '<div class="l2-puzzle-box">' +
            '<h2 style="color:#0f0">REALM 02 RESTORED</h2>' +
            '<p>The second secret lies in the title of this Anime.</p>' +
            '</div>';
        setTimeout(() => {
            window.game.completeLevel(2, fragment);
        }, 1500);
    }
}
window.level2 = new Level2();
