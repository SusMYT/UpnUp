class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Sky gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        bg.fillRect(0, 0, width, height);

        // Floating clouds
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(50, height - 100),
                'cloud'
            );
            cloud.setAlpha(0.2);
            this.tweens.add({
                targets: cloud,
                x: cloud.x + Phaser.Math.Between(-50, 50),
                y: cloud.y + Phaser.Math.Between(-20, 20),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Coin display top right
        const coins = parseInt(localStorage.getItem('upnup_coins') || '0');
        this.add.image(width - 75, 25, 'coin').setScale(0.85);
        this.add.text(width - 55, 25, `${coins}`, {
            fontSize: '18px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);

        // Title
        const title = this.add.text(width / 2, height * 0.2, 'UP n UP', {
            fontSize: '64px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff',
            stroke: '#e74c3c',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: title.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Show equipped skin on menu
        const equipped = localStorage.getItem('upnup_skin') || 'default';
        const playerTexture = 'player_' + equipped;
        const player = this.add.image(width / 2, height * 0.38, playerTexture).setScale(2.2);
        this.tweens.add({
            targets: player,
            y: player.y - 15,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Flame effect under player
        this.add.particles(0, 0, 'flame', {
            follow: player,
            followOffset: { x: -6, y: 20 },
            speed: { min: 20, max: 60 },
            angle: { min: 80, max: 100 },
            scale: { start: 0.8, end: 0 },
            lifespan: 400,
            tint: [0xff6600, 0xff3300, 0xffcc00],
            frequency: 40,
            quantity: 1
        });

        // High score
        const highScore = localStorage.getItem('upnup_highscore') || 0;
        this.add.text(width / 2, height * 0.5, `Best: ${highScore}m`, {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#f1c40f'
        }).setOrigin(0.5);

        // Boost selector
        this.selectedSkip = 0;
        const skips = this.getSkipCount();
        const hasAnySkip = skips.small > 0 || skips.medium > 0 || skips.mega > 0;

        if (hasAnySkip) {
            this.add.text(width / 2, height * 0.555, 'Use Boost:', {
                fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#95a5a6'
            }).setOrigin(0.5);

            const boostOptions = [{ label: 'None', skip: 0, count: 999 }];
            if (skips.small > 0) boostOptions.push({ label: `200m (x${skips.small})`, skip: 200, key: 'small', count: skips.small });
            if (skips.medium > 0) boostOptions.push({ label: `500m (x${skips.medium})`, skip: 500, key: 'medium', count: skips.medium });
            if (skips.mega > 0) boostOptions.push({ label: `1000m (x${skips.mega})`, skip: 1000, key: 'mega', count: skips.mega });

            this.boostIndex = 0;
            this.boostOptions = boostOptions;

            const boostText = this.add.text(width / 2, height * 0.59, boostOptions[0].label, {
                fontSize: '18px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#2ecc71'
            }).setOrigin(0.5);

            const leftArr = this.add.text(width / 2 - 100, height * 0.59, '<', {
                fontSize: '24px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            const rightArr = this.add.text(width / 2 + 100, height * 0.59, '>', {
                fontSize: '24px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            leftArr.on('pointerdown', () => {
                this.boostIndex = (this.boostIndex - 1 + boostOptions.length) % boostOptions.length;
                boostText.setText(boostOptions[this.boostIndex].label);
                this.selectedSkip = boostOptions[this.boostIndex].skip;
            });
            rightArr.on('pointerdown', () => {
                this.boostIndex = (this.boostIndex + 1) % boostOptions.length;
                boostText.setText(boostOptions[this.boostIndex].label);
                this.selectedSkip = boostOptions[this.boostIndex].skip;
            });
        }

        // Play button
        const btn = this.add.image(width / 2, height * 0.68, 'button').setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height * 0.68 - 4, 'PLAY', {
            fontSize: '28px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setScale(1.05));
        btn.on('pointerout', () => btn.setScale(1));
        btn.on('pointerdown', () => {
            btn.setScale(0.95);
            // Consume the boost if one is selected
            if (this.selectedSkip > 0 && this.boostOptions) {
                const opt = this.boostOptions[this.boostIndex];
                if (opt.key) {
                    const sk = this.getSkipCount();
                    sk[opt.key] = Math.max(0, sk[opt.key] - 1);
                    localStorage.setItem('upnup_skips', JSON.stringify(sk));
                }
            }
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('GameScene', { startAltitude: this.selectedSkip });
            });
        });

        // Shop button
        const shopBtn = this.add.image(width / 2, height * 0.8, 'button').setInteractive({ useHandCursor: true }).setScale(0.8);
        this.add.text(width / 2, height * 0.8 - 3, 'SHOP', {
            fontSize: '22px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        shopBtn.on('pointerover', () => shopBtn.setScale(0.85));
        shopBtn.on('pointerout', () => shopBtn.setScale(0.8));
        shopBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(300);
            this.time.delayedCall(300, () => {
                this.scene.start('ShopScene');
            });
        });

        // Hint
        this.add.text(width / 2, height * 0.91, 'Drag to dodge obstacles!', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#95a5a6'
        }).setOrigin(0.5);

        this.cameras.main.fadeIn(500);
    }

    getSkipCount() {
        const raw = localStorage.getItem('upnup_skips');
        return raw ? JSON.parse(raw) : { small: 0, medium: 0, mega: 0 };
    }
}
