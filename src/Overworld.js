class Overworld extends Phaser.Scene {
    constructor() {
        super('overworldScene')
    }

    preload() {
        this.load.path = './assets/'
        this.load.spritesheet('slime', 'slime.png', {
            frameWidth: 16,
            frameHeight: 16
        })

        this.load.image('tilesetImage', 'tileset.png');                 // load the 
        this.load.tilemapTiledJSON('tilemapJSON', 'overworld.json');    // load the json data for our tilemap
    }

    create() {
        // velocity constant
        this.VEL = 100

        // tilemap info
        // tilemap needs to be here becuase we want the slime on top of the map
        const map = this.add.tilemap('tilemapJSON');                    // the JSON tilemap we labeled in preload 
        // connect the image to the data
        // 1st parameter is looking for the name we gave in TILED
        const tileset = map.addTilesetImage('tileset', 'tilesetImage');
        // next we add layers one by one, furthest back goes first
        // first parameter is layer name IN TILED 
        const bgLayer = map.createLayer('Background', tileset, 0, 0);
        const terrainLayer = map.createLayer('Terrain', tileset, 0, 0);



        // add slime
        // use the map to create a spawn for the slime
        const slimeSpawn = map.findObject('Spawns', obj => obj.name === 'slime spawn')
        this.slime = this.physics.add.sprite(slimeSpawn.x, slimeSpawn.y, 'slime', 0)
        this.slime.body.setCollideWorldBounds(true)

        const treeLayer = map.createLayer('Trees', tileset, 0, 0);

        // slime animation
        this.anims.create({
            key: 'jiggle',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('slime', {
                start: 0,
                end: 1
            })
        });

        this.slime.play('jiggle');

        // camera stuff 
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);           // we don't need to know how big the map is 
        this.cameras.main.startFollow(this.slime, true, 0.25, 0.25);

        // set bounds for physics world too
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // collisions
        // set collision by the property we set in Tiled
        terrainLayer.setCollisionByProperty({
            collides: true // the property we set in Tiled 
        });
        this.physics.add.collider(this.slime, terrainLayer);

        treeLayer.setCollisionByProperty({
            collides: true
        });
        this.physics.add.collider(this.slime, treeLayer);

        // input
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    update() {
        // slime movement
        this.direction = new Phaser.Math.Vector2(0)
        if(this.cursors.left.isDown) {
            this.direction.x = -1
        } else if(this.cursors.right.isDown) {
            this.direction.x = 1
        }

        if(this.cursors.up.isDown) {
            this.direction.y = -1
        } else if(this.cursors.down.isDown) {
            this.direction.y = 1
        }

        this.direction.normalize()
        this.slime.setVelocity(this.VEL * this.direction.x, this.VEL * this.direction.y)
    }
}