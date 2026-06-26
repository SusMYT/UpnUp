class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create(data) {
        var self = this;
        var w = this.scale.width;
        var h = this.scale.height;
        var boostTarget = (data && data.startAltitude) ? data.startAltitude : 0;

        this.altitude = 0;
        this.boostTarget = boostTarget;
        this.isBoosting = (boostTarget > 0);
        this.gameSpeed = 2.5;
        this.baseSpeed = 2.5;
        this.isGameOver = false;
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.difficultyTimer = 0;
        this.coinsCollected = 0;
        this.hasShield = false;
        this.bossActive = false;
        this.boss = null;
        this.bossHP = 0;
        this.bossMaxHP = 0;
        this.bossNumber = 0;
        this.nextBossAt = 5000;
        this.bossSpeedBoost = 0;
        this.lastZone = -1;

        // Sky
        this.skyBg = this.add.graphics();
        this.nebulaGfx = this.add.graphics().setDepth(1);

        // Simple sky fill for now
        this.skyBg.fillStyle(0x3498db, 1);
        this.skyBg.fillRect(0, 0, w, h);

        // Clouds
        this.clouds = this.add.group();
        for (var ci = 0; ci < 5; ci++) {
            var cloud = this.add.image(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h), 'cloud');
            cloud.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
            cloud.setScale(Phaser.Math.FloatBetween(0.7, 1.3));
            cloud.setDepth(3);
            this.clouds.add(cloud);
        }

        // Groups
        this.obstacles = this.physics.add.group();
        this.collectibles = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.bossBombs = this.physics.add.group();

        // Player
        var equipped = localStorage.getItem('upnup_skin') || 'default';
        this.player = this.physics.add.sprite(w / 2, h * 0.6, 'player_' + equipped);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1.4);
        this.player.body.setSize(28, 48);
        this.player.body.setOffset(10, 8);
        this.player.body.setAllowGravity(false);
        this.player.setDepth(50);

        // Flame
        this.flameEmitter = this.add.particles(0, 0, 'flame', {
            follow: this.player,
            followOffset: { x: -4, y: 36 },
            speed: { min: 50, max: 120 },
            angle: { min: 75, max: 105 },
            scale: { start: 0.8, end: 0 },
            lifespan: 350,
            tint: [0xff6600, 0xff3300, 0xffcc00],
            frequency: 25,
            quantity: 2
        }).setDepth(49);

        // Shield visual
        this.shieldGfx = this.add.graphics().setDepth(51);

        // UI
        this.altText = this.add.text(w / 2, 24, '0m', {
            fontSize: '32px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5, 0).setDepth(100);

        this.coinIcon = this.add.image(w - 60, 34, 'coin').setDepth(100).setScale(1);
        this.coinText = this.add.text(w - 20, 24, '0', {
            fontSize: '22px', fontFamily: 'Arial, sans-serif',
            color: '#f1c40f', stroke: '#000000', strokeThickness: 3
        }).setOrigin(1, 0).setDepth(100);

        this.zoneText = this.add.text(w / 2, 62, '', {
            fontSize: '14px', fontFamily: 'Arial, sans-serif',
            color: '#ffffff', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(99).setAlpha(0);

        this.shieldIcon = this.add.image(30, 34, 'shield_pickup').setDepth(100).setScale(0.8).setVisible(false);
        this.shieldLabel = this.add.text(52, 24, 'SHIELD', {
            fontSize: '13px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#00cec9', stroke: '#000000', strokeThickness: 3
        }).setDepth(100).setVisible(false);

        // Boss HP bar - positioned below altitude text
        this.bossHPBarBg = this.add.graphics().setDepth(100);
        this.bossHPBarFill = this.add.graphics().setDepth(100);
        this.bossNameText = this.add.text(w / 2, 64, '', {
            fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ff4444', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);
        this.hideBossHP();

        // Boost label
        if (this.isBoosting) {
            this.boostLabel = this.add.text(w / 2, h * 0.42, 'BOOSTING...', {
                fontSize: '30px', fontFamily: 'Arial Black, Arial, sans-serif',
                color: '#2ecc71', stroke: '#000000', strokeThickness: 5
            }).setOrigin(0.5).setDepth(100);
        }

        // Controls
        this.input.on('pointerdown', function(pointer) {
            self.isDragging = true;
            self.dragOffsetX = self.player.x - pointer.x;
        });
        this.input.on('pointermove', function(pointer) {
            if (self.isDragging && pointer.isDown) {
                self.player.x = Phaser.Math.Clamp(pointer.x + self.dragOffsetX, 24, w - 24);
            }
        });
        this.input.on('pointerup', function() { self.isDragging = false; });

        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Collisions
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.collectibles, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        this.physics.add.overlap(this.player, this.bossBombs, this.hitByBomb, null, this);

        // Timers
        this.obstacleTimer = this.time.addEvent({
            delay: 1600, callback: this.spawnObstacle, callbackScope: this, loop: true,
            paused: this.isBoosting
        });
        this.coinTimer = this.time.addEvent({
            delay: 1800, callback: this.spawnCoin, callbackScope: this, loop: true,
            paused: this.isBoosting
        });
        this.shieldTimer = this.time.addEvent({
            delay: 15000, callback: this.maybeSpawnShield, callbackScope: this, loop: true
        });
        this.shootTimer = this.time.addEvent({
            delay: 180, callback: this.shootBullet, callbackScope: this, loop: true, paused: true
        });
        this.bossBombTimer = this.time.addEvent({
            delay: 1100, callback: this.bossFire, callbackScope: this, loop: true, paused: true
        });

        this.cameras.main.fadeIn(300);
    }

    update(time, delta) {
        if (this.isGameOver) return;
        var w = this.scale.width;
        var h = this.scale.height;
        var self = this;

        // Boost zip
        if (this.isBoosting) {
            var boostSpeed = Math.max(8, (this.boostTarget - this.altitude) * 0.05);
            this.altitude += boostSpeed * (delta / 16);
            this.altText.setText(Math.floor(this.altitude) + 'm');

            if (this.altitude >= this.boostTarget) {
                this.altitude = this.boostTarget;
                this.isBoosting = false;
                var bossesSkipped = Math.floor(this.boostTarget / 5000);
                this.bossNumber = bossesSkipped;
                this.nextBossAt = (bossesSkipped + 1) * 5000;
                this.bossSpeedBoost = bossesSkipped * 1.5;
                this.gameSpeed = 2.5 + (this.boostTarget / 500) + this.bossSpeedBoost;
                this.baseSpeed = this.gameSpeed;
                if (this.boostLabel) this.boostLabel.destroy();
                this.obstacleTimer.paused = false;
                this.coinTimer.paused = false;
            }
            return;
        }

        // Movement
        if (this.leftKey.isDown || this.aKey.isDown) this.player.x = Math.max(24, this.player.x - 5);
        if (this.rightKey.isDown || this.dKey.isDown) this.player.x = Math.min(w - 24, this.player.x + 5);
        this.player.y = h * 0.6;
        this.player.setVelocityY(0);

        // Shield visual
        this.shieldGfx.clear();
        if (this.hasShield) {
            this.shieldGfx.lineStyle(2.5, 0x00cec9, 0.7);
            this.shieldGfx.strokeCircle(this.player.x, this.player.y, 38);
            this.shieldGfx.fillStyle(0x00cec9, 0.12);
            this.shieldGfx.fillCircle(this.player.x, this.player.y, 38);
        }

        // Altitude
        if (!this.bossActive) {
            this.altitude += this.gameSpeed * (delta / 16);
        }
        this.altText.setText(Math.floor(this.altitude) + 'm');

        // Boss check
        if (!this.bossActive && Math.floor(this.altitude) >= this.nextBossAt) {
            this.startBossFight();
        }

        // Difficulty
        if (!this.bossActive) {
            this.difficultyTimer += delta;
            if (this.difficultyTimer > 10000) {
                this.difficultyTimer = 0;
                this.gameSpeed = Math.min(this.gameSpeed + 0.3, 12 + this.bossSpeedBoost);
                if (this.obstacleTimer.delay > 600) this.obstacleTimer.delay -= 80;
            }
        }

        var spd = this.bossActive ? 1.2 : this.gameSpeed;

        this.obstacles.getChildren().forEach(function(obs) {
            obs.y += spd;
            if (obs.moveSpeed) {
                obs.x += obs.moveSpeed;
                if (obs.x < 50 || obs.x > w - 50) obs.moveSpeed *= -1;
            }
            if (obs.y > h + 60) obs.destroy();
        });
        this.collectibles.getChildren().forEach(function(c) { c.y += spd; if (c.y > h + 40) c.destroy(); });
        this.powerups.getChildren().forEach(function(p) { p.y += spd; if (p.y > h + 40) p.destroy(); });
        this.bullets.getChildren().forEach(function(b) { b.y -= 10; if (b.y < -20) b.destroy(); });
        this.bossBombs.getChildren().forEach(function(bomb) { bomb.y += 4; if (bomb.y > h + 30) bomb.destroy(); });

        // Boss
        if (this.bossActive && this.boss && this.boss.active) {
            this.boss.x += this.boss.moveDir * this.boss.moveSpd;
            if (this.boss.x < 80 || this.boss.x > w - 80) this.boss.moveDir *= -1;
            this.bullets.getChildren().forEach(function(bullet) {
                if (!bullet.active || !self.boss || !self.boss.active) return;
                if (Math.abs(bullet.x - self.boss.x) < 55 && Math.abs(bullet.y - self.boss.y) < 40) {
                    bullet.destroy();
                    self.damageBoss(1);
                }
            });
            this.drawBossHP();
        }

        // Clouds
        this.clouds.getChildren().forEach(function(cloud) {
            cloud.y += (self.bossActive ? 0.6 : spd * 0.4);
            if (cloud.y > h + 60) { cloud.y = -60; cloud.x = Phaser.Math.Between(0, w); }
        });

        // Sky color based on zone - testing
        this.drawSky();
        this.updateZoneLabel();
    }

    getZone() {
        if (this.altitude < 10000) return 0;
        if (this.altitude < 20000) return 1;
        if (this.altitude < 30000) return 2;
        if (this.altitude < 40000) return 3;
        if (this.altitude < 50000) return 4;
        return 5;
    }

    getZoneProgress() {
        var zone = this.getZone();
        return Math.min(1, (this.altitude - zone * 10000) / 10000);
    }

    drawSky() {
        var w = this.scale.width;
        var h = this.scale.height;
        var zone = this.getZone();
        var p = this.getZoneProgress();

        var zones = [
            { topA: [87,197,255], botA: [52,152,219], topB: [255,140,50], botB: [255,85,50] },
            { topA: [255,140,50], botA: [255,85,50], topB: [25,25,80], botB: [60,40,100] },
            { topA: [25,25,80], botA: [60,40,100], topB: [5,5,30], botB: [10,10,50] },
            { topA: [5,5,30], botA: [10,10,50], topB: [2,2,15], botB: [5,5,25] },
            { topA: [2,2,15], botA: [5,5,25], topB: [8,0,20], botB: [20,5,40] },
            { topA: [8,0,20], botA: [20,5,40], topB: [15,0,30], botB: [30,10,50] }
        ];

        var z = zones[Math.min(zone, zones.length - 1)];
        var tr = Math.round(z.topA[0] + (z.topB[0] - z.topA[0]) * p);
        var tg = Math.round(z.topA[1] + (z.topB[1] - z.topA[1]) * p);
        var tb = Math.round(z.topA[2] + (z.topB[2] - z.topA[2]) * p);
        var br = Math.round(z.botA[0] + (z.botB[0] - z.botA[0]) * p);
        var bg2 = Math.round(z.botA[1] + (z.botB[1] - z.botA[1]) * p);
        var bb = Math.round(z.botA[2] + (z.botB[2] - z.botA[2]) * p);

        var tc = Phaser.Display.Color.GetColor(tr, tg, tb);
        var bc = Phaser.Display.Color.GetColor(br, bg2, bb);

        this.skyBg.clear();
        this.skyBg.fillGradientStyle(tc, tc, bc, bc, 1);
        this.skyBg.fillRect(0, 0, w, h);

        this.nebulaGfx.clear();
        if (this.altitude > 35000) {
            var nebAlpha = Math.min(0.15, (this.altitude - 35000) / 100000);
            this.nebulaGfx.fillStyle(0x9b59b6, nebAlpha);
            this.nebulaGfx.fillCircle(w * 0.2, h * 0.3, 120);
            this.nebulaGfx.fillCircle(w * 0.8, h * 0.6, 100);
        }

        var cloudAlpha = Math.max(0, 1 - this.altitude / 25000);
        this.clouds.getChildren().forEach(function(c) {
            c.setAlpha(cloudAlpha * Phaser.Math.FloatBetween(0.1, 0.3));
        });
    }

    updateZoneLabel() {
        var zone = this.getZone();
        if (zone !== this.lastZone) {
            this.lastZone = zone;
            var names = ['Lower Atmosphere','Sunset Layer','Night Sky','Upper Atmosphere','Deep Space','The Galaxy'];
            this.zoneText.setText(names[Math.min(zone, names.length - 1)]);
            this.zoneText.setAlpha(0.7);
            var zt = this.zoneText;
            this.time.delayedCall(3000, function() { zt.setAlpha(0); });
        }
    }

    maybeSpawnShield() {
        if (this.isGameOver || this.bossActive || this.hasShield || this.isBoosting) return;
        if (Math.random() > 0.4) return;
        var w = this.scale.width;
        var shield = this.powerups.create(Phaser.Math.Between(40, w - 40), -30, 'shield_pickup');
        shield.body.setAllowGravity(false);
        shield.setScale(1.2);
        shield.setDepth(45);
        this.tweens.add({ targets: shield, angle: 360, duration: 3000, repeat: -1 });
    }

    collectPowerup(player, pickup) {
        pickup.destroy();
        this.hasShield = true;
        this.shieldIcon.setVisible(true);
        this.shieldLabel.setVisible(true);
    }

    useShield() {
        this.hasShield = false;
        this.shieldIcon.setVisible(false);
        this.shieldLabel.setVisible(false);
        this.shieldGfx.clear();
        this.cameras.main.shake(200, 0.01);
        this.player.setAlpha(0.5);
        var p = this.player;
        this.time.delayedCall(800, function() { if (p && p.active) p.setAlpha(1); });
    }

    startBossFight() {
        var w = this.scale.width;
        var self = this;
        this.bossActive = true;
        this.bossNumber++;
        this.bossMaxHP = 10 + (this.bossNumber * 5);
        this.bossHP = this.bossMaxHP;
        this.obstacleTimer.paused = true;
        this.coinTimer.paused = true;
        this.obstacles.clear(true, true);
        this.collectibles.clear(true, true);
        this.zoneText.setAlpha(0);

        var warnText = this.add.text(w / 2, 250, 'BOSS ' + this.bossNumber, {
            fontSize: '46px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ff0000', stroke: '#000000', strokeThickness: 7
        }).setOrigin(0.5).setDepth(100).setAlpha(0);
        this.tweens.add({
            targets: warnText, alpha: 1, duration: 400, yoyo: true,
            onComplete: function(t, targets) { targets[0].destroy(); }
        });

        this.time.delayedCall(1500, function() {
            if (self.isGameOver) return;
            self.boss = self.add.image(w / 2, -80, 'boss');
            self.boss.setScale(1.5 + self.bossNumber * 0.2);
            self.boss.setDepth(60);
            self.boss.moveDir = 1;
            self.boss.moveSpd = 1.8 + self.bossNumber * 0.3;
            self.tweens.add({
                targets: self.boss, y: 120, duration: 1000, ease: 'Power2',
                onComplete: function() {
                    self.shootTimer.paused = false;
                    self.bossBombTimer.paused = false;
                    self.showBossHP();
                }
            });
        });
    }

    shootBullet() {
        if (this.isGameOver || !this.bossActive) return;
        var b = this.bullets.create(this.player.x, this.player.y - 30, 'bullet');
        b.body.setAllowGravity(false);
        b.setScale(1.3);
        b.setDepth(45);
    }

    bossFire() {
        if (this.isGameOver || !this.bossActive || !this.boss || !this.boss.active) return;
        var count = Math.min(4, 1 + Math.floor(this.bossNumber / 2));
        for (var i = 0; i < count; i++) {
            var ox = (i - Math.floor(count / 2)) * 35;
            var bomb = this.bossBombs.create(this.boss.x + ox, this.boss.y + 40, 'boss_bomb');
            bomb.body.setAllowGravity(false);
            bomb.setScale(1.3);
            bomb.setDepth(55);
        }
    }

    damageBoss(amount) {
        this.bossHP -= amount;
        var self = this;
        if (this.boss && this.boss.active) {
            this.boss.setTint(0xffffff);
            this.time.delayedCall(60, function() {
                if (self.boss && self.boss.active) self.boss.clearTint();
            });
        }
        if (this.bossHP <= 0) this.defeatBoss();
    }

    defeatBoss() {
        var w = this.scale.width;
        var self = this;
        this.bossActive = false;
        this.shootTimer.paused = true;
        this.bossBombTimer.paused = true;
        this.hideBossHP();
        this.bossBombs.clear(true, true);
        this.bullets.clear(true, true);

        if (this.boss && this.boss.active) {
            this.cameras.main.shake(500, 0.02);
            this.cameras.main.flash(300, 255, 100, 0);
            for (var i = 0; i < 12; i++) {
                var c = this.add.image(
                    this.boss.x + Phaser.Math.Between(-40, 40),
                    this.boss.y + Phaser.Math.Between(-30, 30), 'coin'
                ).setScale(1.2).setDepth(100);
                this.tweens.add({
                    targets: c,
                    x: c.x + Phaser.Math.Between(-100, 100),
                    y: c.y + Phaser.Math.Between(60, 250),
                    alpha: 0, scale: 0.4, duration: 900, delay: i * 40,
                    ease: 'Power2', onComplete: function(t, targets) { targets[0].destroy(); }
                });
            }
            this.coinsCollected += 12;
            this.coinText.setText('' + this.coinsCollected);
            this.boss.destroy();
            this.boss = null;
        }

        var v = this.add.text(w / 2, 240, 'BOSS DEFEATED!', {
            fontSize: '36px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#2ecc71', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(100);
        var s = this.add.text(w / 2, 285, 'SPEED UP!', {
            fontSize: '24px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#f39c12', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
            targets: [v, s], alpha: 0, y: '-=70',
            duration: 2000, delay: 1200, ease: 'Power2',
            onComplete: function(t, targets) { targets[0].destroy(); targets[1].destroy(); }
        });

        this.bossSpeedBoost += 1.5;
        this.gameSpeed = this.baseSpeed + this.bossSpeedBoost;
        this.baseSpeed = this.gameSpeed;
        this.obstacleTimer.delay = Math.max(500, this.obstacleTimer.delay - 200);
        this.nextBossAt += 5000;

        this.time.delayedCall(2000, function() {
            if (self.isGameOver) return;
            self.obstacleTimer.paused = false;
            self.coinTimer.paused = false;
        });
    }

    showBossHP() {
        this.bossHPBarBg.setVisible(true);
        this.bossHPBarFill.setVisible(true);
        this.bossNameText.setVisible(true);
        this.bossNameText.setText('BOSS ' + this.bossNumber);
        this.drawBossHP();
    }

    hideBossHP() {
        this.bossHPBarBg.setVisible(false);
        this.bossHPBarFill.setVisible(false);
        this.bossNameText.setVisible(false);
    }

    drawBossHP() {
        var w = this.scale.width;
        var bw = w - 100;
        var by = 84;
        this.bossHPBarBg.clear();
        this.bossHPBarBg.fillStyle(0x000000, 0.4);
        this.bossHPBarBg.fillRoundedRect(48, by - 2, bw + 4, 18, 6);
        this.bossHPBarBg.fillStyle(0x333333, 0.9);
        this.bossHPBarBg.fillRoundedRect(50, by, bw, 14, 5);
        var pct = Math.max(0, this.bossHP / this.bossMaxHP);
        this.bossHPBarFill.clear();
        if (pct > 0) {
            var col = pct > 0.5 ? 0xe74c3c : (pct > 0.25 ? 0xe67e22 : 0xff0000);
            this.bossHPBarFill.fillStyle(col, 1);
            this.bossHPBarFill.fillRoundedRect(50, by, bw * pct, 14, 5);
            this.bossHPBarFill.fillStyle(0xffffff, 0.15);
            this.bossHPBarFill.fillRoundedRect(50, by, bw * pct, 6, 5);
        }
    }

    hitByBomb(player, bomb) {
        if (this.isGameOver) return;
        bomb.destroy();
        if (this.hasShield) { this.useShield(); return; }
        this.gameOver();
    }

    spawnObstacle() {
        if (this.isGameOver || this.bossActive) return;
        var w = this.scale.width;
        var type = Phaser.Math.Between(0, 10);
        var obs;
        if (type <= 4) {
            obs = this.obstacles.create(Phaser.Math.Between(70, w - 70), -30, 'obstacle');
        } else if (type <= 7) {
            obs = this.obstacles.create(Phaser.Math.Between(110, w - 110), -30, 'obstacle_wide');
        } else {
            obs = this.obstacles.create(Phaser.Math.Between(60, w - 60), -30, 'obstacle_spike');
            obs.moveSpeed = Phaser.Math.Between(1, 3) * (Math.random() < 0.5 ? 1 : -1);
        }
        obs.body.setAllowGravity(false);
        obs.body.setImmovable(true);
    }

    spawnCoin() {
        if (this.isGameOver || this.bossActive) return;
        var w = this.scale.width;
        var count = Phaser.Math.Between(1, 3);
        for (var i = 0; i < count; i++) {
            var coin = this.collectibles.create(Phaser.Math.Between(40, w - 40), -30 - (i * 30), 'coin');
            coin.body.setAllowGravity(false);
            this.tweens.add({ targets: coin, angle: 360, duration: 1500, repeat: -1 });
        }
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.coinsCollected++;
        this.coinText.setText('' + this.coinsCollected);
    }

    hitObstacle(player, obstacle) {
        if (this.isGameOver) return;
        if (this.hasShield) { obstacle.destroy(); this.useShield(); return; }
        this.gameOver();
    }

    gameOver() {
        this.isGameOver = true;
        this.isDragging = false;
        this.flameEmitter.stop();
        this.shootTimer.paused = true;
        this.bossBombTimer.paused = true;
        this.player.setTint(0xff0000);
        this.shieldGfx.clear();
        this.physics.pause();
        this.cameras.main.shake(300, 0.015);

        var currentCoins = parseInt(localStorage.getItem('upnup_coins') || '0');
        localStorage.setItem('upnup_coins', currentCoins + this.coinsCollected);

        var finalScore = Math.floor(this.altitude);
        var highScore = parseInt(localStorage.getItem('upnup_highscore') || '0');
        var isNewBest = finalScore > highScore;
        if (isNewBest) localStorage.setItem('upnup_highscore', finalScore);

        var self = this;
        this.time.delayedCall(800, function() {
            self.scene.start('GameOverScene', {
                score: finalScore,
                coins: self.coinsCollected,
                isNewBest: isNewBest,
                bossesDefeated: self.bossNumber
            });
        });
    }
}
