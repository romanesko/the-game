import {Scene} from 'phaser';
import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;

const SPEED_UP_KOEF = 0.005;

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    player: Phaser.Physics.Arcade.Sprite;
    logo: Phaser.GameObjects.Image;
    cursors: any;
    ts: Phaser.GameObjects.TileSprite;
    velocityCoef: number;
    lastDirection: 'left' | 'right' | null;
    justJumped: boolean;

    constructor() {
        super('Game');

    }

    create() {

        const width = this.scale.width;
        const height = this.scale.height;

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xffffff);
        // this.camera.setBackgroundColor(0);

        const alphaTop = 0.4

        const topColor = 0x448ee4;
        const mainColor = 0x448ee4;

        const graphics = this.add.graphics();

        graphics.fillGradientStyle(topColor, topColor, mainColor, mainColor, alphaTop, alphaTop, 1, 1);
        graphics.fillRect(0, 0, width, height / 2)
        graphics.fillStyle(mainColor, 1);
        graphics.fillRect(0, height / 2, width, height / 2);

        // this.background = this.add.image(sWidth/2, sHeight/2, 'background');
        // this.ts = this.add.tileSprite(0, 0, 0, 0, 'background').setOrigin(0, 0);
        // this.ts = this.add.tileSprite(0, 0, 1024, 768, 'background').scale =2

        const platforms = this.physics.add.staticGroup();
        const r1 = this.add.rectangle(width / 2, height - 40, width, 80, 0x222222);

        platforms.add(r1);

        // platforms.add(this.add.rectangle(800, 600, 48 * 4, 48, 0x222222));
        // platforms.add(this.add.rectangle(400, 450, 48 * 4, 48, 0x222222));
        const k = 1.28
        platforms.create(600 * k, 400 * k, 'ground').setScale(k).refreshBody();
        platforms.create(50 * k, 250 * k, 'ground').setScale(k).refreshBody();
        platforms.create(750 * k, 220 * k, 'ground').setScale(k).refreshBody();


        // this.background.setAlpha(0.5);

        // this.msg_text = this.add.text(512, 384, 'Make something fun!', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // });
        // this.msg_text.setOrigin(0.5);

        // this.input.once('pointerdown', () => {
        //
        //     this.scene.start('GameOver');
        //
        // });

        // this.player = this.physics.add.sprite(100, 450, 'cat')
        this.player = this.physics.add.sprite(100, 450, 'cat')
        this.player.setSize(70, 118);

        // this.player.scale = 0.2;

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        // this.player.debugBodyColor = 0x00ff00;
        // this.player.debugShowBody = true;
        // this.player.setDebug(true, true, 0xff0000);
        // this.physics.world.drawDebug = true;
        // //
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('cat-right', {start: 0, end: 5}),
            frameRate: 10,

            repeat: -1
        });
        //
        this.anims.create({
            key: 'turn',
            frames: this.anims.generateFrameNumbers('cat', {start: 0, end: 1}),
            frameRate: 3,
            repeat: -1
        });


        // this.logo = this.add.image(200, 700, 'logo');

        this.physics.add.collider(this.player, platforms);


        // this.physics.add.collider(this.player, platforms);
        // this.physics.add.existing(this, true)

        // this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        // this.cameras.main.zoom = 0.5;
        // this.cameras.main.setBounds(0,0, 2048, 768);
        // this.cameras.main.startFollow(this.player);
        // this.physics.world.setBounds(0, 0, 2024, 768, true, true, true, true);

        this.cursors = this.input.keyboard!.createCursorKeys();

        const scoreText = this.add.text(16, 16, '0', {fontSize: '32px', fill: '#000'});
        let score = 0;

        const stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: {x: 12, y: 0, stepX: 70 * 1.28}
        });
        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
        this.physics.add.collider(stars, platforms);


        const bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platforms);


        this.physics.add.collider(this.player, bombs, () => {
            this.physics.pause();
            this.player.setTint(0xff0000);
            this.player.anims.play('turn');

            const text = this.add.text(512, 384, 'Game Over', {
                fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            });
            text.setOrigin(0.5);


        }, null, this);


        this.physics.add.overlap(this.player, stars, (player, star) => {
            score += 10;
            scoreText.setText('' + score);
            (star as Phaser.Physics.Arcade.Sprite).disableBody(true, true);

            if (stars.countActive(true) === 0) {
                stars.children.iterate(function (child) {
                    child.enableBody(true, child.x, 0, true, true);
                });

                var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
                var bomb = bombs.create(x, 16, 'bomb');
                bomb.setScale(0.5);
                bomb.setBodySize(48, 48);
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
            ;
        }, undefined, this);

        this.velocityCoef = 1
        this.lastDirection = null;
        this.justJumped = false;
    }


    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.cursors.left.isDown) {
            if (this.lastDirection !== 'left') {
                this.lastDirection = 'left';
                this.velocityCoef = 1;
            }
            this.player.setVelocityX(-160 * this.velocityCoef);
            this.player.setFlipX(true);
            this.player.anims.play('move', true);
            if (this.player.body!.touching.down) {
                this.velocityCoef += SPEED_UP_KOEF;
            }
        } else if (this.cursors.right.isDown) {
            if (this.lastDirection !== 'right') {
                this.lastDirection = 'right';
                this.velocityCoef = 1;
            }
            this.player.setVelocityX(160 * this.velocityCoef);
            this.player.setFlipX(false);
            this.player.anims.play('move', true);
            if (this.player.body!.touching.down) {
                this.velocityCoef += SPEED_UP_KOEF;
            }
        } else {
            this.player.setVelocityX(0);

            this.player.anims.play('turn', true);
        }

        if (this.justJumped &&
            (this.player.body!.touching.down || this.player.body!.touching.up || this.player.body!.touching.left || this.player.body!.touching.right)
        ) {
            console.log('touching')
            this.velocityCoef = 1;
            this.justJumped = false;
        }
        //
        if (this.cursors.up.isDown && this.player.body!.touching.down) {
            // this.player.setVelocityY(-330);
            this.justJumped = true;
            this.player.setVelocityY(-350);
        }


    }

}
