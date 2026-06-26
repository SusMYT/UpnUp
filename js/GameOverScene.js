class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data) {
        const { width, height } = this.scale;
        const { score, coins, isNewBest, bossesDefeated } = data;

        // Dark background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f23, 0x0f0f23, 1);
        bg.fillRect(0, 0, width, height);

        // Game Over title
        this.add.text(width / 2, height * 0.15, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#e74c3c',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Score
        this.add.text(width / 2, height * 0.28, `Altitude: ${score}m`, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Coins earned
        this.add.image(width / 2 - 55, height * 0.37, 'coin').setScale(1);
        this.add.text(width / 2 - 30, height * 0.37, `+${coins} coins`, {
            fontSize: '24px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#f1c40f'
        }).setOrigin(0, 0.5);

        // Bosses defeated
        if (bossesDefeated > 0) {
            this.add.text(width / 2, height * 0.43, `Bosses Defeated: ${bossesDefeated}`, {
                fontSize: '18px',
                fontFamily: 'Arial Black, Arial, sans-serif',
                color: '#e74c3c'
            }).setOrigin(0.5);
        }

        // Total coins
        const totalCoins = parseInt(localStorage.getItem('upnup_coins') || '0');
        this.add.text(width / 2, height * 0.49, `Wallet: ${totalCoins}`, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#95a5a6'
        }).setOrigin(0.5);

        // New best indicator
        if (isNewBest) {
            const newBestText = this.add.text(width / 2, height * 0.52, 'NEW BEST!', {
                fontSize: '28px',
                fontFamily: 'Arial Black, Arial, sans-serif',
                color: '#f1c40f',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);

            this.tweens.add({
                targets: newBestText,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // High score
        const highScore = localStorage.getItem('upnup_highscore') || 0;
        this.add.text(width / 2, height * 0.58, `Best: ${highScore}m`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#95a5a6'
        }).setOrigin(0.5);

        // Retry button
        const btn = this.add.image(width / 2, height * 0.7, 'button').setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height * 0.7 - 4, 'RETRY', {
            fontSize: '28px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setScale(1.05));
        btn.on('pointerout', () => btn.setScale(1));
        btn.on('pointerdown', () => {
            this.cameras.main.fadeOut(300);
            this.time.delayedCall(300, () => {
                this.scene.start('GameScene');
            });
        });

        // Shop button
        const shopBtn = this.add.image(width / 2, height * 0.8, 'button').setInteractive({ useHandCursor: true }).setScale(0.7);
        this.add.text(width / 2, height * 0.8 - 3, 'SHOP', {
            fontSize: '20px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        shopBtn.on('pointerover', () => shopBtn.setScale(0.75));
        shopBtn.on('pointerout', () => shopBtn.setScale(0.7));
        shopBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(300);
            this.time.delayedCall(300, () => {
                this.scene.start('ShopScene');
            });
        });

        // Menu button
        const menuText = this.add.text(width / 2, height * 0.9, 'MENU', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#95a5a6'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuText.on('pointerover', () => menuText.setColor('#ffffff'));
        menuText.on('pointerout', () => menuText.setColor('#95a5a6'));
        menuText.on('pointerdown', () => {
            this.cameras.main.fadeOut(300);
            this.time.delayedCall(300, () => {
                this.scene.start('MenuScene');
            });
        });

        this.cameras.main.fadeIn(500);
    }
}
