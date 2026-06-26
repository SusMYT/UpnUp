var PLANET_THEMES = [
    { name: 'Mars', ground: 0, skyTop: [26,5,5], skyBot: [61,15,15], fuelNeeded: 3, alienType: 'crawler' },
    { name: 'Titan', ground: 1, skyTop: [45,31,0], skyBot: [74,50,0], fuelNeeded: 4, alienType: 'hopper' },
    { name: 'Europa', ground: 2, skyTop: [5,5,32], skyBot: [10,10,61], fuelNeeded: 5, alienType: 'floater' },
    { name: 'Nebula-7', ground: 3, skyTop: [15,0,32], skyBot: [26,0,64], fuelNeeded: 6, alienType: 'shooter' },
    { name: 'Inferno', ground: 4, skyTop: [32,0,0], skyBot: [64,5,5], fuelNeeded: 7, alienType: 'charger' },
    { name: 'The Void', ground: 5, skyTop: [0,0,0], skyBot: [5,5,16], fuelNeeded: 8, alienType: 'phaser' }
];

class PlanetScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlanetScene' });
    }

    create(data) {
        var self = this;
        this.flightData = data || {};
        this.planetIndex = ((data.bossNumber || 1) - 1) % PLANET_THEMES.length;
        this.theme = PLANET_THEMES[this.planetIndex];

        this.fuelCollected = 0;
        this.fuelNeeded = this.theme.fuelNeeded;
        this.playerHP = 2;
        this.isInvincible = false;
        this.isDead = false;
        this.hasLaunched = false;
        this.facingRight = true;
        this.hasShield = data.hasShield || false;
        this.coinsCollected = data.coins || 0;

        var WORLD_W = 2700;
        var WORLD_H = 960;

        // Physics gravity for platforming
        this.physics.world.gravity.y = 800;
        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

        // Sky
        var skyGfx = this.add.graphics();
        var tc = Phaser.Display.Color.GetColor(this.theme.skyTop[0], this.theme.skyTop[1], this.theme.skyTop[2]);
        var bc = Phaser.Display.Color.GetColor(this.theme.skyBot[0], this.theme.skyBot[1], this.theme.skyBot[2]);
        skyGfx.fillGradientStyle(tc, tc, bc, bc, 1);
        skyGfx.fillRect(0, 0, WORLD_W, WORLD_H);

        // Groups
        this.platforms = this.physics.add.staticGroup();
        this.fuelGroup = this.physics.add.group();
        this.aliens = this.physics.add.group();
        this.alienBullets = this.physics.add.group();
        this.playerBullets = this.physics.add.group();

        // Generate terrain
        this.generateTerrain(WORLD_W);

        // Place fuel and aliens
        this.placeFuelCanisters();
        this.placeAliens();

        // Launch pad
        this.launchPad = this.add.image(this.launchPadX, this.launchPadY - 16, 'launch_pad').setDepth(5);
        this.launchZone = this.add.zone(this.launchPadX, this.launchPadY - 30, 96, 40);
        this.physics.add.existing(this.launchZone, true);

        // Player
        var equipped = localStorage.getItem('upnup_skin') || 'default';
        this.player = this.physics.add.sprite(100, 600, 'player_' + equipped);
        this.player.setScale(1.4);
        this.player.body.setSize(20, 48);
        this.player.body.setOffset(14, 8);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(50);

        // Camera
        this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.startFollow(this.player, false, 0.1, 0);

        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.aliens, this.platforms);
        this.physics.add.overlap(this.player, this.fuelGroup, this.collectFuel, null, this);
        this.physics.add.overlap(this.player, this.aliens, this.handleAlienContact, null, this);
        this.physics.add.overlap(this.player, this.alienBullets, this.hitByAlienBullet, null, this);
        this.physics.add.overlap(this.player, this.launchZone, this.checkLaunchPad, null, this);
        this.physics.add.overlap(this.playerBullets, this.aliens, this.bulletHitAlien, null, this);

        // UI (fixed to camera)
        this.fuelIcon = this.add.image(30, 30, 'fuel_icon').setScrollFactor(0).setDepth(100);
        this.fuelText = this.add.text(48, 20, '0 / ' + this.fuelNeeded, {
            fontSize: '20px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#2ecc71', stroke: '#000000', strokeThickness: 4
        }).setScrollFactor(0).setDepth(100);

        this.coinIcon = this.add.image(this.scale.width - 60, 30, 'coin').setScrollFactor(0).setDepth(100);
        this.coinText = this.add.text(this.scale.width - 20, 20, '' + this.coinsCollected, {
            fontSize: '20px', fontFamily: 'Arial, sans-serif',
            color: '#f1c40f', stroke: '#000000', strokeThickness: 3
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        this.hpText = this.add.text(this.scale.width / 2, 20, 'HP: 2', {
            fontSize: '18px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

        // Planet name announcement
        var nameText = this.add.text(this.scale.width / 2, this.scale.height * 0.3, this.theme.name, {
            fontSize: '42px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#ffffff', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        this.tweens.add({
            targets: nameText, alpha: 0, y: nameText.y - 40,
            duration: 2500, delay: 1500, ease: 'Power2',
            onComplete: function(t, targets) { targets[0].destroy(); }
        });

        // Shield indicator
        this.shieldGfx = this.add.graphics().setDepth(51);
        if (this.hasShield) {
            this.shieldText = this.add.text(this.scale.width / 2, 48, 'SHIELD ACTIVE', {
                fontSize: '12px', fontFamily: 'Arial, sans-serif',
                color: '#00cec9', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        }

        // Launch prompt (hidden until ready)
        this.launchPrompt = this.add.text(this.scale.width / 2, this.scale.height * 0.4, '', {
            fontSize: '24px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#2ecc71', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);

        // Controls
        this.cursors = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            shoot: Phaser.Input.Keyboard.KeyCodes.X
        });

        // Virtual buttons for mobile
        this.setupMobileControls();

        // Shoot cooldown
        this.canShoot = true;
        this.shootCooldown = 400;

        // Click/tap to shoot (when not pressing a virtual button)
        this.tapToShoot = false;
        this.input.on('pointerdown', function(pointer) {
            SFX.init();
            // Only shoot if not tapping a virtual button area
            var px = pointer.x;
            var py = pointer.y;
            var h = self.scale.height;
            var w = self.scale.width;
            // Virtual buttons are in bottom 90px band
            if (py < h - 90) {
                self.tapToShoot = true;
            }
        });
        this.input.on('pointerup', function() {
            self.tapToShoot = false;
        });

        SFX.play('planetLand');
        this.cameras.main.fadeIn(500);
    }

    setupMobileControls() {
        var w = this.scale.width;
        var h = this.scale.height;
        this.mobileLeft = false;
        this.mobileRight = false;
        this.mobileJump = false;
        this.mobileShoot = false;

        var btnY = h - 45;

        var leftBtn = this.add.image(50, btnY, 'btn_left').setScrollFactor(0).setDepth(200).setAlpha(0.6).setInteractive();
        var rightBtn = this.add.image(120, btnY, 'btn_right').setScrollFactor(0).setDepth(200).setAlpha(0.6).setInteractive();
        var jumpBtn = this.add.image(w - 50, btnY, 'btn_jump').setScrollFactor(0).setDepth(200).setAlpha(0.6).setInteractive();
        var shootBtn = this.add.image(w - 120, btnY, 'btn_shoot').setScrollFactor(0).setDepth(200).setAlpha(0.6).setInteractive();

        var self = this;
        leftBtn.on('pointerdown', function() { self.mobileLeft = true; });
        leftBtn.on('pointerup', function() { self.mobileLeft = false; });
        leftBtn.on('pointerout', function() { self.mobileLeft = false; });
        rightBtn.on('pointerdown', function() { self.mobileRight = true; });
        rightBtn.on('pointerup', function() { self.mobileRight = false; });
        rightBtn.on('pointerout', function() { self.mobileRight = false; });
        jumpBtn.on('pointerdown', function() { self.mobileJump = true; });
        jumpBtn.on('pointerup', function() { self.mobileJump = false; });
        jumpBtn.on('pointerout', function() { self.mobileJump = false; });
        shootBtn.on('pointerdown', function() { self.mobileShoot = true; });
        shootBtn.on('pointerup', function() { self.mobileShoot = false; });
        shootBtn.on('pointerout', function() { self.mobileShoot = false; });
    }

    update(time, delta) {
        if (this.isDead || this.hasLaunched) return;
        var self = this;

        // Launch check - use position instead of overlap flag
        var nearPad = Math.abs(this.player.x - this.launchPadX) < 100 && Math.abs(this.player.y - this.launchPadY) < 80;
        if (!nearPad) {
            this.launchPrompt.setVisible(false);
        }
        if (nearPad && this.tapToShoot && this.fuelCollected >= this.fuelNeeded) {
            this.launchSequence();
            return;
        }

        // Movement
        var moveLeft = this.cursors.left.isDown || this.cursors.a.isDown || this.mobileLeft;
        var moveRight = this.cursors.right.isDown || this.cursors.d.isDown || this.mobileRight;
        var jumpPressed = this.cursors.up.isDown || this.cursors.w.isDown || this.cursors.space.isDown || this.mobileJump;
        var shootPressed = this.cursors.shoot.isDown || this.mobileShoot || this.tapToShoot;

        if (moveLeft) {
            this.player.setVelocityX(-200);
            this.player.setFlipX(true);
            this.facingRight = false;
        } else if (moveRight) {
            this.player.setVelocityX(200);
            this.player.setFlipX(false);
            this.facingRight = true;
        } else {
            this.player.setVelocityX(0);
        }

        var onGround = this.player.body.blocked.down || this.player.body.touching.down;
        if (jumpPressed && onGround) {
            this.player.setVelocityY(-420);
            SFX.play('jump');
        }

        // Shooting
        if (shootPressed && this.canShoot) {
            this.shootPlayerBullet();
        }

        // Shield visual
        this.shieldGfx.clear();
        if (this.hasShield) {
            this.shieldGfx.lineStyle(2, 0x00cec9, 0.6);
            this.shieldGfx.strokeCircle(this.player.x, this.player.y, 35);
        }

        // Alien AI
        this.updateAliens(time, delta);

        // Player bullets movement
        this.playerBullets.getChildren().forEach(function(b) {
            if (b.x < 0 || b.x > 2700) b.destroy();
        });

        // Alien bullets movement
        this.alienBullets.getChildren().forEach(function(b) {
            if (b.x < 0 || b.x > 2700 || b.y > 960) b.destroy();
        });

        // Fall death
        if (this.player.y > 920) {
            this.playerDamage();
        }
    }

    // ── Terrain Generation ──

    generateTerrain(worldW) {
        var gi = this.theme.ground;
        var lastY = 800;
        this.terrainSegments = [];

        // Starting zone - flat ground
        this.addGroundBlock(0, lastY, 300, gi);
        this.terrainSegments.push({ x: 100, y: lastY, w: 300, type: 'ground' });

        // Middle segments - keep jumps reachable, stop early to leave room for launch zone
        for (var i = 1; i < 10; i++) {
            var segX = 250 + i * 210;
            var roll = Math.random();

            if (roll < 0.4) {
                var yShift = Phaser.Math.Between(-60, 40);
                lastY = Phaser.Math.Clamp(lastY + yShift, 650, 850);
                this.addGroundBlock(segX, lastY, 180, gi);
                this.terrainSegments.push({ x: segX + 90, y: lastY, w: 180, type: 'ground' });
            } else if (roll < 0.75) {
                var platY = Phaser.Math.Clamp(lastY + Phaser.Math.Between(-100, 50), 580, 830);
                this.addPlatform(segX + 30, platY, gi);
                this.terrainSegments.push({ x: segX + 94, y: platY, w: 128, type: 'platform' });
                lastY = platY;
            } else {
                var rescueY = Phaser.Math.Clamp(lastY + Phaser.Math.Between(-80, 30), 600, 820);
                this.addPlatform(segX + 50, rescueY, gi);
                this.terrainSegments.push({ x: segX + 114, y: rescueY, w: 128, type: 'platform' });
                lastY = rescueY;
            }
        }

        // End zone - flat ground with launch pad on top, no overlap with last segment
        var endY = 800;
        this.addGroundBlock(2400, endY, 300, gi);
        this.launchPadX = 2530;
        this.launchPadY = endY;
        this.terrainSegments.push({ x: 2530, y: endY, w: 300, type: 'launchpad' });
    }

    addGroundBlock(x, y, width, themeIdx) {
        var tilesNeeded = Math.ceil(width / 64);
        for (var i = 0; i < tilesNeeded; i++) {
            var tile = this.platforms.create(x + i * 64 + 32, y + 32, 'planet_ground_' + themeIdx);
            tile.setScale(1).refreshBody();
        }
    }

    addPlatform(x, y, themeIdx) {
        var plat = this.platforms.create(x + 64, y + 12, 'planet_platform_' + themeIdx);
        plat.setScale(1).refreshBody();
    }

    // ── Fuel ──

    placeFuelCanisters() {
        var validSegs = [];
        for (var i = 1; i < this.terrainSegments.length - 1; i++) {
            validSegs.push(this.terrainSegments[i]);
        }
        Phaser.Utils.Array.Shuffle(validSegs);
        var count = Math.min(this.fuelNeeded + 2, validSegs.length);
        for (var f = 0; f < count; f++) {
            var seg = validSegs[f];
            var fuel = this.fuelGroup.create(seg.x + Phaser.Math.Between(-30, 30), seg.y - 30, 'fuel_canister');
            fuel.body.setAllowGravity(false);
            fuel.setDepth(10);
            this.tweens.add({
                targets: fuel, y: fuel.y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        }
    }

    collectFuel(player, fuel) {
        fuel.destroy();
        this.fuelCollected++;
        this.fuelText.setText(this.fuelCollected + ' / ' + this.fuelNeeded);
        this.coinsCollected += 2;
        this.coinText.setText('' + this.coinsCollected);
        SFX.play('fuelPickup');

        if (this.fuelCollected >= this.fuelNeeded) {
            this.fuelText.setColor('#f1c40f');
            this.launchPad.setTint(0x00ff00);
        }
    }

    // ── Aliens ──

    placeAliens() {
        var alienIdx = this.planetIndex;
        var density = 1 + Math.floor(this.planetIndex / 2);

        for (var i = 2; i < this.terrainSegments.length - 1; i++) {
            var seg = this.terrainSegments[i];
            if (Math.random() < 0.5 + this.planetIndex * 0.05) {
                for (var d = 0; d < density && d < 2; d++) {
                    var ax = seg.x + Phaser.Math.Between(-30, 30);
                    var ay = seg.y - 50;
                    var alien = this.aliens.create(ax, ay, 'alien_' + alienIdx);
                    alien.setDepth(40);
                    alien.body.setSize(24, 24);
                    alien.body.setOffset(4, 4);
                    alien.body.checkCollision.left = false;
                    alien.body.checkCollision.right = false;
                    alien.alienType = this.theme.alienType;
                    alien.startX = ax;
                    alien.moveDir = 1;
                    alien.aiTimer = 0;
                    alien.setBounce(0);
                }
            }
        }
    }

    updateAliens(time, delta) {
        var self = this;
        var px = this.player.x;
        var py = this.player.y;

        this.aliens.getChildren().forEach(function(alien) {
            if (!alien.active) return;
            alien.aiTimer += delta;

            switch (alien.alienType) {
                case 'crawler':
                    alien.setVelocityX(alien.moveDir * 60);
                    if (Math.abs(alien.x - alien.startX) > 80) alien.moveDir *= -1;
                    alien.setFlipX(alien.moveDir < 0);
                    break;

                case 'hopper':
                    alien.setVelocityX(alien.moveDir * 30);
                    if (Math.abs(alien.x - alien.startX) > 50) alien.moveDir *= -1;
                    if (alien.aiTimer > 1500 && (alien.body.blocked.down || alien.body.touching.down)) {
                        alien.setVelocityY(-300);
                        alien.aiTimer = 0;
                    }
                    break;

                case 'floater':
                    alien.body.setAllowGravity(false);
                    alien.x = alien.startX + Math.sin(time * 0.002 + alien.startX) * 60;
                    alien.y = alien.y + Math.sin(time * 0.003) * 0.3;
                    break;

                case 'shooter':
                    alien.setVelocityX(alien.moveDir * 40);
                    if (Math.abs(alien.x - alien.startX) > 60) alien.moveDir *= -1;
                    if (alien.aiTimer > 2000 && Math.abs(px - alien.x) < 300) {
                        self.alienFireBullet(alien);
                        alien.aiTimer = 0;
                    }
                    break;

                case 'charger':
                    if (Math.abs(px - alien.x) < 200) {
                        var dir = px < alien.x ? -1 : 1;
                        alien.setVelocityX(dir * 150);
                        alien.setFlipX(dir < 0);
                    } else {
                        alien.setVelocityX(alien.moveDir * 40);
                        if (Math.abs(alien.x - alien.startX) > 60) alien.moveDir *= -1;
                    }
                    break;

                case 'phaser':
                    alien.body.setAllowGravity(false);
                    if (alien.aiTimer > 2000) {
                        alien.setAlpha(0.2);
                        alien.x = alien.startX + Phaser.Math.Between(-80, 80);
                        alien.aiTimer = 0;
                        self.time.delayedCall(300, function() {
                            if (alien && alien.active) alien.setAlpha(1);
                        });
                    }
                    break;
            }
        });
    }

    alienFireBullet(alien) {
        var dir = this.player.x < alien.x ? -1 : 1;
        var bullet = this.alienBullets.create(alien.x + dir * 16, alien.y, 'alien_bullet');
        bullet.body.setAllowGravity(false);
        bullet.setVelocityX(dir * 200);
        bullet.setDepth(35);
        SFX.play('alienShoot');
    }

    // ── Combat ──

    handleAlienContact(player, alien) {
        if (this.isInvincible || this.isDead) return;

        if (player.body.velocity.y > 0 && player.body.bottom <= alien.body.top + 15) {
            this.stompAlien(alien);
        } else {
            this.playerDamage();
        }
    }

    stompAlien(alien) {
        this.player.setVelocityY(-250);
        alien.destroy();
        this.coinsCollected += Phaser.Math.Between(1, 3);
        this.coinText.setText('' + this.coinsCollected);
        SFX.play('stomp');
    }

    bulletHitAlien(bullet, alien) {
        bullet.destroy();
        alien.destroy();
        this.coinsCollected += Phaser.Math.Between(1, 3);
        this.coinText.setText('' + this.coinsCollected);
        SFX.play('stomp');
    }

    hitByAlienBullet(player, bullet) {
        if (this.isInvincible || this.isDead) return;
        bullet.destroy();
        this.playerDamage();
    }

    shootPlayerBullet() {
        if (!this.canShoot) return;
        this.canShoot = false;
        var dir = this.facingRight ? 1 : -1;
        var b = this.playerBullets.create(this.player.x + dir * 20, this.player.y - 5, 'player_bullet');
        b.body.setAllowGravity(false);
        b.setVelocityX(dir * 400);
        b.setFlipX(!this.facingRight);
        b.setDepth(45);
        SFX.play('playerShoot');

        var self = this;
        this.time.delayedCall(this.shootCooldown, function() { self.canShoot = true; });
    }

    playerDamage() {
        if (this.isInvincible || this.isDead) return;

        if (this.hasShield) {
            this.hasShield = false;
            if (this.shieldText) this.shieldText.destroy();
            this.shieldGfx.clear();
            SFX.play('shieldBreak');
            this.triggerInvincibility();
            return;
        }

        this.playerHP--;
        this.hpText.setText('HP: ' + this.playerHP);
        SFX.play('planetHit');

        if (this.playerHP <= 0) {
            this.playerDeath();
            return;
        }

        // Knockback
        var kbDir = this.facingRight ? -1 : 1;
        this.player.setVelocityX(kbDir * 200);
        this.player.setVelocityY(-200);
        this.triggerInvincibility();
    }

    triggerInvincibility() {
        this.isInvincible = true;
        var p = this.player;
        var self = this;
        var flicker = this.time.addEvent({
            delay: 100, repeat: 14,
            callback: function() { p.setAlpha(p.alpha < 1 ? 1 : 0.3); }
        });
        this.time.delayedCall(1500, function() {
            self.isInvincible = false;
            if (p && p.active) p.setAlpha(1);
        });
    }

    playerDeath() {
        this.isDead = true;
        this.player.setTint(0xff0000);
        this.physics.pause();
        SFX.play('death');
        this.cameras.main.shake(300, 0.015);

        // Save coins earned so far
        var currentCoins = parseInt(localStorage.getItem('upnup_coins') || '0');
        localStorage.setItem('upnup_coins', currentCoins + this.coinsCollected);

        var self = this;
        var w = this.scale.width;
        var h = this.scale.height;

        // Retry button
        var retryBtn = this.add.image(w / 2, h * 0.5, 'button').setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });
        this.add.text(w / 2, h * 0.5 - 4, 'RETRY PLANET', {
            fontSize: '22px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        retryBtn.on('pointerdown', function() {
            self.flightData.coins = 0;
            self.flightData.hasShield = false;
            self.scene.restart(self.flightData);
        });

        // Give Up button
        var giveUpBtn = this.add.image(w / 2, h * 0.6, 'button').setScrollFactor(0).setDepth(200).setScale(0.8).setInteractive({ useHandCursor: true });
        this.add.text(w / 2, h * 0.6 - 3, 'GIVE UP', {
            fontSize: '18px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        giveUpBtn.on('pointerdown', function() {
            var finalScore = Math.floor(self.flightData.altitude || 0);
            var highScore = parseInt(localStorage.getItem('upnup_highscore') || '0');
            var isNewBest = finalScore > highScore;
            if (isNewBest) localStorage.setItem('upnup_highscore', finalScore);
            self.scene.start('GameOverScene', {
                score: finalScore,
                coins: 0,
                isNewBest: isNewBest,
                bossesDefeated: self.flightData.bossNumber || 0
            });
        });

        // Menu button
        var menuText = this.add.text(w / 2, h * 0.7, 'MENU', {
            fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#95a5a6'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });

        menuText.on('pointerover', function() { menuText.setColor('#ffffff'); });
        menuText.on('pointerout', function() { menuText.setColor('#95a5a6'); });
        menuText.on('pointerdown', function() {
            self.scene.start('MenuScene');
        });
    }

    // ── Launch ──

    checkLaunchPad(player, zone) {
        if (this.hasLaunched || this.isDead) return;
        this.onLaunchPad = true;

        if (this.fuelCollected >= this.fuelNeeded) {
            this.launchPrompt.setVisible(true);
            this.launchPrompt.setText('TAP TO LAUNCH!');
            this.launchPrompt.setColor('#2ecc71');
        } else {
            this.launchPrompt.setVisible(true);
            this.launchPrompt.setText('Need ' + (this.fuelNeeded - this.fuelCollected) + ' more fuel!');
            this.launchPrompt.setColor('#e74c3c');
        }
    }

    launchSequence() {
        this.hasLaunched = true;
        this.launchPrompt.setVisible(false);
        this.physics.pause();
        SFX.play('launch');

        var self = this;

        var launchText = this.add.text(this.scale.width / 2, this.scale.height * 0.4, 'LAUNCHING!', {
            fontSize: '36px', fontFamily: 'Arial Black, Arial, sans-serif',
            color: '#2ecc71', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.tweens.add({
            targets: this.player, y: -100, duration: 1500, ease: 'Power2',
            onComplete: function() {
                self.cameras.main.fadeOut(500, 0, 0, 0);
                self.time.delayedCall(600, function() {
                    self.scene.start('GameScene', {
                        fromPlanet: true,
                        startAltitude: self.flightData.altitude,
                        coins: self.coinsCollected,
                        bossNumber: self.flightData.bossNumber,
                        obstacleSpeed: self.flightData.obstacleSpeed,
                        obstacleDelay: self.flightData.obstacleDelay,
                        nextBossAt: self.flightData.nextBossAt,
                        bossGap: self.flightData.bossGap,
                        hasShield: self.hasShield
                    });
                });
            }
        });
    }
}
