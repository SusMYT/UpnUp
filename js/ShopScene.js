class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.currentTab = 'skins';

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        bg.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 30, 'SHOP', {
            fontSize: '36px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Coin display
        const coins = this.getCoins();
        this.coinIcon = this.add.image(width / 2 - 50, 68, 'coin').setScale(1);
        this.coinText = this.add.text(width / 2 - 35, 68, `${coins}`, {
            fontSize: '22px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);

        // Tabs
        this.skinsTab = this.add.text(width * 0.25, 100, 'ASTRONAUTS', {
            fontSize: '16px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.powerTab = this.add.text(width * 0.75, 100, 'POWER-UPS', {
            fontSize: '16px',
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#95a5a6'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Tab underlines
        this.skinUnderline = this.add.graphics();
        this.powerUnderline = this.add.graphics();
        this.drawTabUnderlines();

        this.skinsTab.on('pointerdown', () => { this.currentTab = 'skins'; this.refreshShop(); });
        this.powerTab.on('pointerdown', () => { this.currentTab = 'powerups'; this.refreshShop(); });

        // Content container
        this.shopContent = this.add.container(0, 0);

        // Back button
        const backText = this.add.text(40, 30, '< BACK', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#95a5a6'
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
        backText.on('pointerover', () => backText.setColor('#ffffff'));
        backText.on('pointerout', () => backText.setColor('#95a5a6'));
        backText.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        this.refreshShop();
        this.cameras.main.fadeIn(300);
    }

    drawTabUnderlines() {
        const { width } = this.scale;
        this.skinUnderline.clear();
        this.powerUnderline.clear();

        if (this.currentTab === 'skins') {
            this.skinUnderline.lineStyle(3, 0xe74c3c, 1);
            this.skinUnderline.lineBetween(width * 0.1, 114, width * 0.4, 114);
            this.skinsTab.setColor('#ffffff');
            this.powerTab.setColor('#95a5a6');
        } else {
            this.powerUnderline.lineStyle(3, 0xe74c3c, 1);
            this.powerUnderline.lineBetween(width * 0.6, 114, width * 0.9, 114);
            this.skinsTab.setColor('#95a5a6');
            this.powerTab.setColor('#ffffff');
        }
    }

    refreshShop() {
        this.shopContent.removeAll(true);
        this.drawTabUnderlines();
        this.coinText.setText(`${this.getCoins()}`);

        if (this.currentTab === 'skins') {
            this.showSkins();
        } else {
            this.showPowerups();
        }
    }

    showSkins() {
        const { width } = this.scale;
        const owned = this.getOwnedSkins();
        const equipped = localStorage.getItem('upnup_skin') || 'default';

        const skins = [
            { id: 'default', name: 'Rookie', price: 0, texture: 'player_default' },
            { id: 'inferno', name: 'Inferno', price: 150, texture: 'player_inferno' },
            { id: 'toxic', name: 'Toxic', price: 200, texture: 'player_toxic' },
            { id: 'galaxy', name: 'Galaxy', price: 300, texture: 'player_galaxy' },
            { id: 'gold', name: 'Gold', price: 500, texture: 'player_gold' },
            { id: 'shadow', name: 'Shadow', price: 400, texture: 'player_shadow' },
            { id: 'ice', name: 'Ice', price: 250, texture: 'player_ice' },
            { id: 'wings', name: 'Wings', price: 750, texture: 'player_wings' },
            { id: 'cheddarfries', name: 'Cheddar Fries', price: 500, texture: 'player_cheddarfries' },
            { id: 'croccat', name: 'Croc Cat', price: 600, texture: 'player_croccat' },
        ];

        const startY = 125;
        const cardH = 68;

        skins.forEach((skin, i) => {
            const y = startY + i * cardH;
            const isOwned = owned.includes(skin.id);
            const isEquipped = equipped === skin.id;

            // Card background
            const card = this.add.graphics();
            card.fillStyle(isEquipped ? 0x1e3a5f : 0x0d1b2a, 0.8);
            card.fillRoundedRect(20, y, width - 40, cardH - 8, 12);
            if (isEquipped) {
                card.lineStyle(2, 0x00cec9, 1);
                card.strokeRoundedRect(20, y, width - 40, cardH - 8, 12);
            }
            this.shopContent.add(card);

            // Player preview
            const preview = this.add.image(60, y + (cardH - 8) / 2, skin.texture).setScale(0.9);
            this.shopContent.add(preview);

            // Name
            const nameText = this.add.text(100, y + 18, skin.name, {
                fontSize: '18px',
                fontFamily: 'Arial Black, Arial, sans-serif',
                color: '#ffffff'
            });
            this.shopContent.add(nameText);

            // Price or status
            if (isEquipped) {
                const eqBtn = this.add.image(width - 80, y + (cardH - 8) / 2, 'button_equipped');
                const eqText = this.add.text(width - 80, y + (cardH - 8) / 2 - 2, 'EQUIPPED', {
                    fontSize: '12px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff'
                }).setOrigin(0.5);
                this.shopContent.add(eqBtn);
                this.shopContent.add(eqText);
            } else if (isOwned) {
                const equipBtn = this.add.image(width - 80, y + (cardH - 8) / 2, 'button_small').setInteractive({ useHandCursor: true });
                const equipText = this.add.text(width - 80, y + (cardH - 8) / 2 - 2, 'EQUIP', {
                    fontSize: '13px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff'
                }).setOrigin(0.5);
                equipBtn.on('pointerdown', () => {
                    localStorage.setItem('upnup_skin', skin.id);
                    this.refreshShop();
                });
                this.shopContent.add(equipBtn);
                this.shopContent.add(equipText);
            } else {
                const canAfford = this.getCoins() >= skin.price;
                const buyBtn = this.add.image(width - 80, y + (cardH - 8) / 2,
                    canAfford ? 'button_small' : 'button_disabled'
                ).setInteractive({ useHandCursor: canAfford });
                const priceLabel = this.add.text(width - 80, y + (cardH - 8) / 2 - 2, `${skin.price}`, {
                    fontSize: '13px', fontFamily: 'Arial Black, Arial, sans-serif',
                    color: canAfford ? '#ffffff' : '#bdc3c7'
                }).setOrigin(0.5);
                const coinSmall = this.add.image(width - 108, y + (cardH - 8) / 2 - 1, 'coin').setScale(0.6);
                this.shopContent.add(coinSmall);

                if (canAfford) {
                    buyBtn.on('pointerdown', () => {
                        this.spendCoins(skin.price);
                        this.addOwnedSkin(skin.id);
                        localStorage.setItem('upnup_skin', skin.id);
                        this.refreshShop();
                    });
                }
                this.shopContent.add(buyBtn);
                this.shopContent.add(priceLabel);
            }
        });
    }

    showPowerups() {
        const { width } = this.scale;
        const skips = this.getSkipCount();

        const powerups = [
            { id: 'skip_small', name: 'Small Boost', desc: 'Start at 200m', skip: 200, price: 50 },
            { id: 'skip_medium', name: 'Big Boost', desc: 'Start at 500m', skip: 500, price: 100 },
            { id: 'skip_mega', name: 'Mega Boost', desc: 'Start at 1000m', skip: 1000, price: 200 },
        ];

        const startY = 140;
        const cardH = 100;

        // Owned skips display
        const ownedY = startY;
        const ownedCard = this.add.graphics();
        ownedCard.fillStyle(0x0d1b2a, 0.8);
        ownedCard.fillRoundedRect(20, ownedY, width - 40, 60, 10);
        this.shopContent.add(ownedCard);

        this.shopContent.add(this.add.text(width / 2, ownedY + 15, 'Your Boosts:', {
            fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#95a5a6'
        }).setOrigin(0.5));

        const skipLabels = [];
        if (skips.small > 0) skipLabels.push(`200m x${skips.small}`);
        if (skips.medium > 0) skipLabels.push(`500m x${skips.medium}`);
        if (skips.mega > 0) skipLabels.push(`1000m x${skips.mega}`);
        const skipStr = skipLabels.length > 0 ? skipLabels.join('  |  ') : 'None';

        this.shopContent.add(this.add.text(width / 2, ownedY + 38, skipStr, {
            fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#2ecc71'
        }).setOrigin(0.5));

        powerups.forEach((item, i) => {
            const y = startY + 80 + i * cardH;
            const canAfford = this.getCoins() >= item.price;

            const card = this.add.graphics();
            card.fillStyle(0x0d1b2a, 0.8);
            card.fillRoundedRect(20, y, width - 40, cardH - 10, 10);
            this.shopContent.add(card);

            this.shopContent.add(this.add.text(40, y + 14, item.name, {
                fontSize: '18px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff'
            }));

            this.shopContent.add(this.add.text(40, y + 40, item.desc, {
                fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#95a5a6'
            }));

            // Arrow icon to indicate boost
            this.shopContent.add(this.add.text(40, y + 58, `+${item.skip}m head start`, {
                fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#2ecc71'
            }));

            const buyBtn = this.add.image(width - 80, y + (cardH - 10) / 2,
                canAfford ? 'button_small' : 'button_disabled'
            ).setInteractive({ useHandCursor: canAfford });

            const priceLabel = this.add.text(width - 75, y + (cardH - 10) / 2 - 2, `${item.price}`, {
                fontSize: '13px', fontFamily: 'Arial Black, Arial, sans-serif',
                color: canAfford ? '#ffffff' : '#bdc3c7'
            }).setOrigin(0.5);
            const coinSmall = this.add.image(width - 104, y + (cardH - 10) / 2 - 1, 'coin').setScale(0.6);
            this.shopContent.add(coinSmall);

            if (canAfford) {
                buyBtn.on('pointerdown', () => {
                    this.spendCoins(item.price);
                    this.addSkip(item.id);
                    this.refreshShop();
                });
            }

            this.shopContent.add(buyBtn);
            this.shopContent.add(priceLabel);
        });
    }

    getCoins() {
        return parseInt(localStorage.getItem('upnup_coins') || '0');
    }

    spendCoins(amount) {
        const current = this.getCoins();
        localStorage.setItem('upnup_coins', Math.max(0, current - amount));
    }

    getOwnedSkins() {
        const raw = localStorage.getItem('upnup_owned_skins');
        return raw ? JSON.parse(raw) : ['default'];
    }

    addOwnedSkin(skinId) {
        const owned = this.getOwnedSkins();
        if (!owned.includes(skinId)) {
            owned.push(skinId);
            localStorage.setItem('upnup_owned_skins', JSON.stringify(owned));
        }
    }

    getSkipCount() {
        const raw = localStorage.getItem('upnup_skips');
        return raw ? JSON.parse(raw) : { small: 0, medium: 0, mega: 0 };
    }

    addSkip(skipId) {
        const skips = this.getSkipCount();
        if (skipId === 'skip_small') skips.small++;
        if (skipId === 'skip_medium') skips.medium++;
        if (skipId === 'skip_mega') skips.mega++;
        localStorage.setItem('upnup_skips', JSON.stringify(skips));
    }
}
