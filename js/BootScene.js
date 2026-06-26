class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.image('player_wings', 'assets/playerskin_wings.png');
        this.load.image('boss', 'assets/bossship_Salad.png');
    }

    create() {
        this.generateAssets();
        this.generatePlanetAssets();
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

        // Rainbow star pickup
        var rbGfx = this.make.graphics({ x: 0, y: 0, add: false });
        rbGfx.fillStyle(0xff0000, 0.2);
        rbGfx.fillCircle(18, 18, 18);
        rbGfx.fillStyle(0xff0000, 0.8);
        rbGfx.fillCircle(18, 18, 13);
        rbGfx.fillStyle(0xff8800, 0.7);
        rbGfx.fillCircle(18, 18, 10);
        rbGfx.fillStyle(0xffff00, 0.7);
        rbGfx.fillCircle(18, 18, 7);
        rbGfx.fillStyle(0x00ff00, 0.8);
        rbGfx.fillCircle(18, 14, 5);
        rbGfx.fillStyle(0x0088ff, 0.7);
        rbGfx.fillCircle(15, 18, 4);
        rbGfx.fillStyle(0xaa00ff, 0.7);
        rbGfx.fillCircle(21, 18, 4);
        rbGfx.fillStyle(0xffffff, 0.6);
        rbGfx.fillCircle(15, 14, 3);
        rbGfx.generateTexture('rainbow_pickup', 36, 36);
        rbGfx.destroy();

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

        // Boss ship loaded from assets/bossship_Salad.png in preload()

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

    generatePlanetAssets() {
        var themes = [
            { ground: 0xc0392b, light: 0xe74c3c },
            { ground: 0xd68910, light: 0xf0b429 },
            { ground: 0x2980b9, light: 0x74b9ff },
            { ground: 0x7d3c98, light: 0xaf7ac5 },
            { ground: 0xd63031, light: 0xff7675 },
            { ground: 0x2d3436, light: 0x636e72 }
        ];

        for (var t = 0; t < themes.length; t++) {
            var th = themes[t];
            // Ground tile 64x64
            var gg = this.make.graphics({ x: 0, y: 0, add: false });
            gg.fillStyle(th.ground, 1);
            gg.fillRect(0, 0, 64, 64);
            gg.fillStyle(th.light, 0.3);
            gg.fillRect(0, 0, 64, 8);
            gg.fillStyle(0x000000, 0.15);
            gg.fillRect(0, 56, 64, 8);
            gg.fillStyle(th.light, 0.1);
            for (var d = 0; d < 5; d++) {
                gg.fillCircle(Phaser.Math.Between(5, 59), Phaser.Math.Between(12, 52), Phaser.Math.Between(2, 5));
            }
            gg.generateTexture('planet_ground_' + t, 64, 64);
            gg.destroy();

            // Platform 128x24
            var pg = this.make.graphics({ x: 0, y: 0, add: false });
            pg.fillStyle(th.ground, 1);
            pg.fillRoundedRect(0, 0, 128, 24, 6);
            pg.fillStyle(th.light, 0.3);
            pg.fillRoundedRect(0, 0, 128, 8, 6);
            pg.fillStyle(0x000000, 0.15);
            pg.fillRect(4, 18, 120, 4);
            pg.generateTexture('planet_platform_' + t, 128, 24);
            pg.destroy();
        }

        // Alien textures
        var alienColors = [
            { body: 0x27ae60, eye: 0xffff00 },
            { body: 0xe67e22, eye: 0xff0000 },
            { body: 0x00cec9, eye: 0xffffff },
            { body: 0x8e44ad, eye: 0xff00ff },
            { body: 0xe74c3c, eye: 0xffcc00 },
            { body: 0x636e72, eye: 0x00ff00 }
        ];
        for (var a = 0; a < 6; a++) {
            var ac = alienColors[a];
            var ag = this.make.graphics({ x: 0, y: 0, add: false });
            ag.fillStyle(ac.body, 1);
            ag.fillRoundedRect(4, 8, 24, 20, 6);
            ag.fillStyle(ac.body, 0.8);
            ag.fillCircle(16, 8, 10);
            // Eyes
            ag.fillStyle(0xffffff, 1);
            ag.fillCircle(12, 6, 4);
            ag.fillCircle(20, 6, 4);
            ag.fillStyle(ac.eye, 1);
            ag.fillCircle(13, 6, 2);
            ag.fillCircle(21, 6, 2);
            // Feet
            ag.fillStyle(ac.body, 0.7);
            ag.fillRoundedRect(6, 26, 8, 6, 2);
            ag.fillRoundedRect(18, 26, 8, 6, 2);
            ag.generateTexture('alien_' + a, 32, 32);
            ag.destroy();
        }

        // Fuel canister 20x28
        var fg = this.make.graphics({ x: 0, y: 0, add: false });
        fg.fillStyle(0x2ecc71, 1);
        fg.fillRoundedRect(4, 4, 12, 20, 3);
        fg.fillStyle(0x27ae60, 1);
        fg.fillRect(6, 0, 8, 4);
        fg.fillStyle(0x58d68d, 0.5);
        fg.fillRect(6, 6, 4, 14);
        fg.fillStyle(0xf1c40f, 1);
        fg.fillRect(7, 12, 6, 3);
        fg.generateTexture('fuel_canister', 20, 28);
        fg.destroy();

        // Fuel icon (small, for HUD)
        var fi = this.make.graphics({ x: 0, y: 0, add: false });
        fi.fillStyle(0x2ecc71, 1);
        fi.fillRoundedRect(2, 2, 10, 16, 2);
        fi.fillStyle(0x27ae60, 1);
        fi.fillRect(4, 0, 6, 3);
        fi.fillStyle(0xf1c40f, 1);
        fi.fillRect(5, 9, 4, 2);
        fi.generateTexture('fuel_icon', 14, 20);
        fi.destroy();

        // Launch pad 96x32
        var lp = this.make.graphics({ x: 0, y: 0, add: false });
        lp.fillStyle(0x7f8c8d, 1);
        lp.fillRoundedRect(0, 16, 96, 16, 4);
        lp.fillStyle(0x95a5a6, 0.5);
        lp.fillRect(4, 18, 88, 4);
        // Chevrons
        lp.fillStyle(0xf1c40f, 1);
        for (var ch = 0; ch < 5; ch++) {
            lp.fillRect(8 + ch * 18, 20, 10, 8);
        }
        // Rocket arrow
        lp.fillStyle(0x2ecc71, 0.9);
        lp.fillTriangle(48, 0, 36, 16, 60, 16);
        lp.generateTexture('launch_pad', 96, 32);
        lp.destroy();

        // Alien bullet 10x10
        var ab = this.make.graphics({ x: 0, y: 0, add: false });
        ab.fillStyle(0x00ff00, 0.3);
        ab.fillCircle(5, 5, 5);
        ab.fillStyle(0x00ff00, 1);
        ab.fillCircle(5, 5, 3);
        ab.fillStyle(0xaaffaa, 0.8);
        ab.fillCircle(4, 4, 1);
        ab.generateTexture('alien_bullet', 10, 10);
        ab.destroy();

        // Virtual buttons
        var btnSize = 56;
        var makeBtn = function(scene, key, color, symbol) {
            var bg = scene.make.graphics({ x: 0, y: 0, add: false });
            bg.fillStyle(color, 0.4);
            bg.fillCircle(btnSize / 2, btnSize / 2, btnSize / 2);
            bg.fillStyle(color, 0.7);
            bg.fillCircle(btnSize / 2, btnSize / 2, btnSize / 2 - 4);
            // Draw symbol
            bg.fillStyle(0xffffff, 0.9);
            if (symbol === 'left') {
                bg.fillTriangle(16, 28, 38, 16, 38, 40);
            } else if (symbol === 'right') {
                bg.fillTriangle(40, 28, 18, 16, 18, 40);
            } else if (symbol === 'jump') {
                bg.fillTriangle(28, 14, 16, 38, 40, 38);
            } else if (symbol === 'shoot') {
                bg.fillCircle(28, 28, 8);
            }
            bg.generateTexture(key, btnSize, btnSize);
            bg.destroy();
        };
        makeBtn(this, 'btn_left', 0x3498db, 'left');
        makeBtn(this, 'btn_right', 0x3498db, 'right');
        makeBtn(this, 'btn_jump', 0x2ecc71, 'jump');
        makeBtn(this, 'btn_shoot', 0xe74c3c, 'shoot');

        // Player bullet (sideways) 12x8
        var pb = this.make.graphics({ x: 0, y: 0, add: false });
        pb.fillStyle(0x00fff0, 0.3);
        pb.fillEllipse(6, 4, 12, 8);
        pb.fillStyle(0x00fff0, 1);
        pb.fillEllipse(6, 4, 8, 5);
        pb.fillStyle(0xffffff, 0.8);
        pb.fillEllipse(4, 3, 4, 3);
        pb.generateTexture('player_bullet', 12, 8);
        pb.destroy();
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

