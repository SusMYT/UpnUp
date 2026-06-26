const config = {
    type: Phaser.AUTO,
    width: 540,
    height: 960,
    parent: document.body,
    backgroundColor: '#3498db',
    antialias: true,
    roundPixels: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene, ShopScene]
};

const game = new Phaser.Game(config);
