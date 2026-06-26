class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        this.generateAssets();
        this.scene.start('MenuScene');
    }

    generatePlayer(key, bodyColor, headColor, helmetColor, visorColor, bootColor) {
        var gfx = this.make.graphics({ x: 0, y: 0, add: false });

        // Body (suit)
        gfx.fillStyle(bodyColor, 1);
        gfx.fillRoundedRect(14, 18, 20, 28, 4);
        // Suit highlight
        gfx.fillStyle(0xffffff, 0.08);
        gfx.fillRect(26, 20, 6, 24);

        // Head
        gfx.fillStyle(headColor, 1);
        gfx.fillCircle(24, 12, 10);

        // Helmet
        gfx.fillStyle(helmetColor, 1);
        gfx.fillRoundedRect(14, 3, 20, 10, 4);
        // Visor
        gfx.fillStyle(visorColor, 0.9);
        gfx.fillRoundedRect(17, 5, 14, 6, 3);
        // Visor shine
        gfx.fillStyle(0xffffff, 0.4);
        gfx.fillCircle(20, 7, 2);

        // Jetpack
        gfx.fillStyle(0x636e72, 1);
        gfx.fillRoundedRect(4, 20, 9, 22, 3);
        // Jetpack stripe
        gfx.fillStyle(0x95a5a6, 1);
        gfx.fillRect(6, 23, 5, 2);
        gfx.fillRect(6, 28, 5, 2);
        gfx.fillRect(6, 33, 5, 2);
        // Nozzle
        gfx.fillStyle(0x4a4a4a, 1);
        gfx.fillRoundedRect(5, 40, 7, 5, 2);

        // Arms
        gfx.fillStyle(bodyColor, 1);
        gfx.fillRoundedRect(34, 22, 6, 14, 3);

        // Legs
        gfx.fillStyle(helmetColor, 1);
        gfx.fillRoundedRect(16, 46, 7, 12, 2);
        gfx.fillRoundedRect(25, 46, 7, 12, 2);

        // Boots
        gfx.fillStyle(bootColor, 1);
        gfx.fillRoundedRect(14, 55, 10, 6, 2);
        gfx.fillRoundedRect(24, 55, 10, 6, 2);

        // Belt
        gfx.fillStyle(0x000000, 0.15);
        gfx.fillRect(14, 43, 20, 3);

        gfx.generateTexture(key, 48, 64);
        gfx.destroy();
    }

    generateAssets() {
        this.generatePlayer('player_default', 0x3498db, 0xf5cba7, 0x2c3e50, 0x00fff0, 0xe74c3c);
        this.generatePlayer('player_inferno', 0xe74c3c, 0xf5cba7, 0x2c3e50, 0xff6600, 0xff9900);
        this.generatePlayer('player_toxic', 0x27ae60, 0xf5cba7, 0x1a5230, 0x00ff88, 0x2ecc71);
        this.generatePlayer('player_galaxy', 0x8e44ad, 0xf5cba7, 0x4a235a, 0xff00ff, 0x9b59b6);
        this.generatePlayer('player_gold', 0xf39c12, 0xf5cba7, 0x7d6608, 0xffeaa7, 0xf1c40f);
        this.generatePlayer('player_shadow', 0x2c3e50, 0x95a5a6, 0x1a252f, 0xe74c3c, 0x34495e);
        this.generatePlayer('player_ice', 0x74b9ff, 0xdfe6e9, 0x0984e3, 0x00cec9, 0x81ecec);

        // Flame particle (larger, softer)
        const flameGfx = this.make.graphics({ x: 0, y: 0, add: false });
        flameGfx.fillStyle(0xff6600, 1);
        flameGfx.fillCircle(8, 8, 8);
        flameGfx.fillStyle(0xffcc00, 0.6);
        flameGfx.fillCircle(8, 6, 4);
        flameGfx.generateTexture('flame', 16, 16);
        flameGfx.destroy();

        // Obstacle - beam (wider, more detailed)
        const obstGfx = this.make.graphics({ x: 0, y: 0, add: false });
        obstGfx.fillStyle(0xe74c3c, 1);
        obstGfx.fillRoundedRect(0, 0, 120, 24, 6);
        obstGfx.fillStyle(0xc0392b, 1);
        obstGfx.fillRoundedRect(0, 0, 120, 6, { tl: 6, tr: 6, bl: 0, br: 0 });
        obstGfx.fillRoundedRect(0, 18, 120, 6, { tl: 0, tr: 0, bl: 6, br: 6 });
        // Hazard stripes
        obstGfx.fillStyle(0xb03a2e, 1);
        for (let i = 0; i < 120; i += 20) {
            obstGfx.fillRect(i, 8, 10, 8);
        }
        obstGfx.generateTexture('obstacle', 120, 24);
        obstGfx.destroy();

        // Wide obstacle
        const wideObstGfx = this.make.graphics({ x: 0, y: 0, add: false });
        wideObstGfx.fillStyle(0xe67e22, 1);
        wideObstGfx.fillRoundedRect(0, 0, 200, 24, 6);
        wideObstGfx.fillStyle(0xd35400, 1);
        wideObstGfx.fillRoundedRect(0, 0, 200, 6, { tl: 6, tr: 6, bl: 0, br: 0 });
        wideObstGfx.fillRoundedRect(0, 18, 200, 6, { tl: 0, tr: 0, bl: 6, br: 6 });
        wideObstGfx.fillStyle(0xba6b15, 1);
        for (let i = 0; i < 200; i += 20) {
            wideObstGfx.fillRect(i, 8, 10, 8);
        }
        wideObstGfx.generateTexture('obstacle_wide', 200, 24);
        wideObstGfx.destroy();

        // Spike obstacle
        const spikeGfx = this.make.graphics({ x: 0, y: 0, add: false });
        spikeGfx.fillStyle(0x9b59b6, 1);
        spikeGfx.fillRoundedRect(0, 8, 100, 20, 4);
        spikeGfx.fillStyle(0x8e44ad, 1);
        for (let i = 0; i < 100; i += 14) {
            spikeGfx.fillTriangle(i, 8, i + 7, 0, i + 14, 8);
            spikeGfx.fillTriangle(i, 28, i + 7, 36, i + 14, 28);
        }
        spikeGfx.fillStyle(0x7d3c98, 0.5);
        spikeGfx.fillRect(0, 14, 100, 4);
        spikeGfx.generateTexture('obstacle_spike', 100, 36);
        spikeGfx.destroy();

        // Star (UI icon)
        const starGfx = this.make.graphics({ x: 0, y: 0, add: false });
        starGfx.fillStyle(0xf1c40f, 1);
        const cx = 14, cy = 14, outerR = 14, innerR = 6;
        const pts = [];
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
            pts.push(cx + r * Math.cos(a));
            pts.push(cy + r * Math.sin(a));
        }
        starGfx.fillPoints(pts, true);
        starGfx.fillStyle(0xf9e547, 0.4);
        starGfx.fillCircle(cx, cy, 5);
        starGfx.generateTexture('star', 28, 28);
        starGfx.destroy();

        // Coin (larger, more detailed)
        const coinGfx = this.make.graphics({ x: 0, y: 0, add: false });
        coinGfx.fillStyle(0xf1c40f, 1);
        coinGfx.fillCircle(14, 14, 14);
        coinGfx.fillStyle(0xf39c12, 1);
        coinGfx.fillCircle(14, 14, 11);
        coinGfx.fillStyle(0xf7dc6f, 1);
        coinGfx.fillCircle(14, 14, 8);
        coinGfx.fillStyle(0xf9e547, 0.5);
        coinGfx.fillCircle(11, 11, 4);
        // $ symbol
        coinGfx.lineStyle(2.5, 0xd68910, 1);
        coinGfx.beginPath();
        coinGfx.arc(14, 14, 5, -0.9, 0.9, true);
        coinGfx.strokePath();
        coinGfx.generateTexture('coin', 28, 28);
        coinGfx.destroy();

        // Shield pickup
        const shieldGfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Outer glow
        shieldGfx.fillStyle(0x00cec9, 0.25);
        shieldGfx.fillCircle(18, 18, 18);
        // Shield body
        shieldGfx.fillStyle(0x00cec9, 0.8);
        shieldGfx.fillCircle(18, 18, 13);
        // Inner shine
        shieldGfx.fillStyle(0x81ecec, 0.6);
        shieldGfx.fillCircle(18, 18, 9);
        // Highlight
        shieldGfx.fillStyle(0xffffff, 0.5);
        shieldGfx.fillCircle(14, 13, 4);
        // S letter
        shieldGfx.lineStyle(3, 0x006266, 1);
        shieldGfx.beginPath();
        shieldGfx.arc(18, 15, 4, -2.2, 0.3, false);
        shieldGfx.strokePath();
        shieldGfx.beginPath();
        shieldGfx.arc(18, 21, 4, -2.8, 1.0, true);
        shieldGfx.strokePath();
        shieldGfx.generateTexture('shield_pickup', 36, 36);
        shieldGfx.destroy();

        // Clouds (larger, softer)
        const cloudGfx = this.make.graphics({ x: 0, y: 0, add: false });
        cloudGfx.fillStyle(0xffffff, 0.25);
        cloudGfx.fillCircle(35, 28, 25);
        cloudGfx.fillCircle(70, 24, 30);
        cloudGfx.fillCircle(110, 28, 25);
        cloudGfx.fillCircle(65, 36, 22);
        cloudGfx.fillStyle(0xffffff, 0.15);
        cloudGfx.fillCircle(50, 35, 20);
        cloudGfx.fillCircle(90, 35, 18);
        cloudGfx.generateTexture('cloud', 140, 60);
        cloudGfx.destroy();

        // Button
        const btnGfx = this.make.graphics({ x: 0, y: 0, add: false });
        btnGfx.fillStyle(0xe74c3c, 1);
        btnGfx.fillRoundedRect(0, 0, 240, 64, 14);
        btnGfx.fillStyle(0xc0392b, 1);
        btnGfx.fillRoundedRect(0, 50, 240, 14, { tl: 0, tr: 0, bl: 14, br: 14 });
        btnGfx.fillStyle(0xef5350, 0.3);
        btnGfx.fillRoundedRect(4, 4, 232, 24, { tl: 12, tr: 12, bl: 0, br: 0 });
        btnGfx.generateTexture('button', 240, 64);
        btnGfx.destroy();

        // Small button
        const smBtnGfx = this.make.graphics({ x: 0, y: 0, add: false });
        smBtnGfx.fillStyle(0x2ecc71, 1);
        smBtnGfx.fillRoundedRect(0, 0, 130, 44, 10);
        smBtnGfx.fillStyle(0x27ae60, 1);
        smBtnGfx.fillRoundedRect(0, 34, 130, 10, { tl: 0, tr: 0, bl: 10, br: 10 });
        smBtnGfx.generateTexture('button_small', 130, 44);
        smBtnGfx.destroy();

        // Disabled button
        const disBtnGfx = this.make.graphics({ x: 0, y: 0, add: false });
        disBtnGfx.fillStyle(0x7f8c8d, 1);
        disBtnGfx.fillRoundedRect(0, 0, 130, 44, 10);
        disBtnGfx.fillStyle(0x636e72, 1);
        disBtnGfx.fillRoundedRect(0, 34, 130, 10, { tl: 0, tr: 0, bl: 10, br: 10 });
        disBtnGfx.generateTexture('button_disabled', 130, 44);
        disBtnGfx.destroy();

        // Equipped badge
        const eqGfx = this.make.graphics({ x: 0, y: 0, add: false });
        eqGfx.fillStyle(0x00cec9, 1);
        eqGfx.fillRoundedRect(0, 0, 130, 44, 10);
        eqGfx.fillStyle(0x00b5b0, 1);
        eqGfx.fillRoundedRect(0, 34, 130, 10, { tl: 0, tr: 0, bl: 10, br: 10 });
        eqGfx.generateTexture('button_equipped', 130, 44);
        eqGfx.destroy();

        // Bullet
        var bulletGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bulletGfx.fillStyle(0x00fff0, 0.2);
        bulletGfx.fillEllipse(6, 10, 10, 18);
        bulletGfx.fillStyle(0x00fff0, 1);
        bulletGfx.fillEllipse(6, 10, 5, 14);
        bulletGfx.fillStyle(0xffffff, 0.9);
        bulletGfx.fillEllipse(6, 6, 3, 6);
        bulletGfx.generateTexture('bullet', 12, 20);
        bulletGfx.destroy();

        // Boss ship - cleaner UFO/saucer design
        var bossGfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Shadow/glow under
        bossGfx.fillStyle(0x660000, 0.3);
        bossGfx.fillEllipse(60, 50, 100, 20);
        // Main saucer body
        bossGfx.fillStyle(0x8b0000, 1);
        bossGfx.fillEllipse(60, 35, 110, 35);
        // Top dome
        bossGfx.fillStyle(0xcc0000, 1);
        bossGfx.fillEllipse(60, 28, 60, 28);
        // Dome highlight
        bossGfx.fillStyle(0xff2222, 0.6);
        bossGfx.fillEllipse(60, 22, 40, 16);
        // Core eye
        bossGfx.fillStyle(0xff0000, 1);
        bossGfx.fillCircle(60, 35, 8);
        bossGfx.fillStyle(0xffcc00, 0.8);
        bossGfx.fillCircle(60, 35, 4);
        // Side lights
        bossGfx.fillStyle(0xff6600, 0.9);
        bossGfx.fillCircle(20, 38, 5);
        bossGfx.fillCircle(100, 38, 5);
        bossGfx.fillCircle(38, 46, 4);
        bossGfx.fillCircle(82, 46, 4);
        // Bottom rim
        bossGfx.fillStyle(0x660000, 1);
        bossGfx.fillEllipse(60, 44, 90, 10);
        // Engine glow
        bossGfx.fillStyle(0xff4400, 0.7);
        bossGfx.fillEllipse(45, 52, 12, 6);
        bossGfx.fillEllipse(75, 52, 12, 6);
        bossGfx.generateTexture('boss', 120, 60);
        bossGfx.destroy();

        // Boss bomb - energy ball
        var bombGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bombGfx.fillStyle(0xff3300, 0.2);
        bombGfx.fillCircle(10, 10, 10);
        bombGfx.fillStyle(0xff4400, 0.8);
        bombGfx.fillCircle(10, 10, 7);
        bombGfx.fillStyle(0xff8800, 1);
        bombGfx.fillCircle(10, 10, 4);
        bombGfx.fillStyle(0xffdd44, 0.8);
        bombGfx.fillCircle(9, 8, 2);
        bombGfx.generateTexture('boss_bomb', 20, 20);
        bombGfx.destroy();
    }

    getSkinColors(skinId) {
        const skins = {
            default:  [0x3498db, 0xf5cba7, 0x2c3e50, 0x00fff0, 0xe74c3c],
            inferno:  [0xe74c3c, 0xf5cba7, 0x2c3e50, 0xff6600, 0xff9900],
            toxic:    [0x27ae60, 0xf5cba7, 0x1a5230, 0x00ff88, 0x2ecc71],
            galaxy:   [0x8e44ad, 0xf5cba7, 0x4a235a, 0xff00ff, 0x9b59b6],
            gold:     [0xf39c12, 0xf5cba7, 0x7d6608, 0xffeaa7, 0xf1c40f],
            shadow:   [0x2c3e50, 0x95a5a6, 0x1a252f, 0xe74c3c, 0x34495e],
            ice:      [0x74b9ff, 0xdfe6e9, 0x0984e3, 0x00cec9, 0x81ecec],
        };
        return skins[skinId] || skins.default;
    }
}

