var Main = function(game){
    this.heartEmitter = null;
};

var score = 0;

Main.prototype = {
    create: function() {
        this.tileVelocity = -450;
        this.rate = 1500;
        score = 0;

        this.tileWidth = this.game.cache.getImage('tile').width;
        this.tileHeight = this.game.cache.getImage('tile').height;
        this.boxHeight = this.game.cache.getImage('box').height;

        this.game.stage.backgroundColor = '0xFF1493';
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // Initialize heart emitter
        this.heartEmitter = new HeartEmitter(this.game);
        this.heartEmitter.setHeartInterval(1000); // Generate hearts every 2 seconds
        this.heartEmitter.startAutoGeneration();

        // Create existing game elements
        this.floor = this.game.add.group();
        this.floor.enableBody = true;
        this.floor.createMultiple(Math.ceil(this.game.world.width / this.tileWidth), 'tile');

        this.boxes = this.game.add.group();
        this.boxes.enableBody = true;
        this.boxes.createMultiple(20, 'box');
        
        this.jumping = false;

        this.addBase();
        this.createScore();
        this.createPlayer();
        
        // Ensure player and game elements are above hearts
        this.game.world.bringToTop(this.floor);
        this.game.world.bringToTop(this.boxes);
        this.game.world.bringToTop(this.player);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.timer = game.time.events.loop(this.rate, this.addObstacles, this);
        this.Scoretimer = game.time.events.loop(100, this.incrementScore, this);
    },

    update: function() {
        // Update heart emitter
        if (this.heartEmitter) {
            this.heartEmitter.update();
        }

        // Existing game logic
        this.game.physics.arcade.collide(this.player, this.floor);
        this.game.physics.arcade.collide(this.player, this.boxes, this.gameOver, null, this);

        var onTheGround = this.player.body.touching.down;

        if (onTheGround) {
            this.jumps = 2;
            this.jumping = false;
        }

        if (this.jumps > 0 && this.upInputIsActive(5)) {
            this.player.body.velocity.y = -1000;
            this.jumping = true;
        }

        if (this.jumping && this.upInputReleased()) {
            this.jumps--;
            this.jumping = false;
        }
    },

    gameOver: function(){
        // Stop heart generation before transitioning
        if (this.heartEmitter) {
            this.heartEmitter.stopAutoGeneration();
        }
        this.game.state.start('GameOver');
    },

	addBox: function (x, y) {

		var tile = this.boxes.getFirstDead();

		tile.reset(x, y);
		tile.body.velocity.x = this.tileVelocity;
		tile.body.immovable = true;
		tile.checkWorldBounds = true;
		tile.outOfBoundsKill = true;
		// tile.body.friction.x = 1000;
	},

	addObstacles: function () {
		var tilesNeeded = Math.floor( Math.random() * (5));
		// var gap = Math.floor( Math.random() * (tilesNeeded - 0));
		if (this.rate > 200) {
			this.rate -= 10;
			this.tileVelocity = -(675000 / this.rate);

		}

		for (var i = 0; i < tilesNeeded; i++) {

			this.addBox(this.game.world.width , this.game.world.height -
				this.tileHeight - ((i + 1)* this.boxHeight ));

		}
	},

	addTile: function (x, y) {

		var tile = this.floor.getFirstDead();

		tile.reset(x, y);
		// tile.body.velocity.y = me.vel;
		tile.body.immovable = true;
		tile.checkWorldBounds = true;
		tile.outOfBoundsKill = true;
		// tile.body.friction.x = 1000;
	},

	addBase: function () {
		var tilesNeeded = Math.ceil(this.game.world.width / this.tileWidth);
		var y = (this.game.world.height - this.tileHeight);

		for (var i = 0; i < tilesNeeded; i++) {

			this.addTile(i * this.tileWidth, y);

		}
	},

	upInputIsActive: function (duration) {
		var isActive = false;

		isActive = this.input.keyboard.downDuration(Phaser.Keyboard.UP, duration);
		isActive |= (this.game.input.activePointer.justPressed(duration + 1000 / 60) &&
			this.game.input.activePointer.x > this.game.width / 4 &&
			this.game.input.activePointer.x < this.game.width / 2 + this.game.width / 4);

		return isActive;
	},

	// This function returns true when the player releases the "jump" control
	upInputReleased: function () {
		var released = false;

		released = this.input.keyboard.upDuration(Phaser.Keyboard.UP);
		released |= this.game.input.activePointer.justReleased();

		return released;
	},

	createPlayer: function () {

		this.player = this.game.add.sprite(this.game.world.width/5, this.game.world.height -
			(this.tileHeight*2), 'player');
		this.player.scale.setTo(4, 4);
		this.player.anchor.setTo(0.5, 1.0);
		this.game.physics.arcade.enable(this.player);
		this.player.body.gravity.y = 2200;
		this.player.body.collideWorldBounds = true;
		this.player.body.bounce.y = 0.1;
		this.player.body.drag.x = 150;
		var walk = this.player.animations.add('walk');
		this.player.animations.play('walk', 20, true);

	},

	createScore: function () {

		var scoreFont = "70px 'Dancing Script', cursive";

		this.scoreLabel = this.game.add.text(this.game.world.centerX, 70, "0", { font: scoreFont, fill: "#fff" });
		this.scoreLabel.anchor.setTo(0.5, 0.5);
		this.scoreLabel.align = 'center';
		this.game.world.bringToTop(this.scoreLabel);

		this.highScore = this.game.add.text(this.game.world.centerX * 1.6, 70, "0", { font: scoreFont, fill: "#fff" });
		this.highScore.anchor.setTo(0.5, 0.5);
		this.highScore.align = 'right';
		this.game.world.bringToTop(this.highScore);

		if (window.localStorage.getItem('HighScore') == null) {
			this.highScore.setText(0);
			window.localStorage.setItem('HighScore', 0);
		}
		else {
			this.highScore.setText(window.localStorage.getItem('HighScore'));
		}
		// this.scoreLabel.bringToTop()

	},

	incrementScore: function () {


		score += 1;
		this.scoreLabel.setText(score);
		this.game.world.bringToTop(this.scoreLabel);
		this.highScore.setText("HS: " + window.localStorage.getItem('HighScore'));
		this.game.world.bringToTop(this.highScore);


	},

	gameOver: function(){
        if (this.heartEmitter) {
            this.heartEmitter.stopAutoGeneration();
        }
        this.game.state.start('GameOver');
    }

};

class Heart extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y);
        
        let graphics = game.add.graphics(0, 0);
        graphics.beginFill(0x660000, 0.8); // Pink with some transparency
        graphics.lineStyle(2, 0xFF1493, 1); // Darker pink outline
        
        // Draw heart shape
        graphics.moveTo(0, -10);
        graphics.bezierCurveTo(-15, -25, -30, -10, -30, 5);
        graphics.bezierCurveTo(-30, 25, -10, 35, 0, 45);
        graphics.bezierCurveTo(10, 35, 30, 25, 30, 5);
        graphics.bezierCurveTo(30, -10, 15, -25, 0, -10);
        
        let texture = graphics.generateTexture();
        graphics.destroy();
        
        this.loadTexture(texture);
        this.anchor.set(0.5);
        
        // Smaller hearts with falling movement
        this.scale.set(0.2 + Math.random() * 0.3);
        
        // Falling speed and gentle swaying
        this.speedY = 2 + Math.random() * 3; // Falling speed
        this.speedX = Math.random() * 2 - 1; // Gentle side-to-side movement
        this.swayAmount = 1 + Math.random() * 1; // How much it sways
        this.swaySpeed = 0.02 + Math.random() * 0.03; // How fast it sways
        this.swayPos = Math.random() * Math.PI * 2; // Random start position for sway
        
        this.alpha = 0.7;
        this.rotation = Math.random() * 0.5 - 0.25; // Slight random rotation
        
        game.add.existing(this);
    }
    
    update() {
        // Update falling movement
        this.y += this.speedY;
        
        // Add gentle swaying motion
        this.swayPos += this.swaySpeed;
        this.x += Math.sin(this.swayPos) * this.swayAmount;
        
        // Rotate slightly while falling
        this.rotation += 0.01;
        
        // Remove when it goes off screen
        if (this.y > this.game.height + 50) {
            this.destroy();
        }
    }
}

class HeartEmitter {
    constructor(game) {
        this.game = game;
        this.hearts = [];
        this.nextHeartTime = 0;
        this.heartInterval = 1000;
        this.enabled = false;
    }
    
    startAutoGeneration() {
        this.enabled = true;
    }
    
    stopAutoGeneration() {
        this.enabled = false;
    }
    
    setHeartInterval(interval) {
        this.heartInterval = interval;
    }
    
    update() {
        this.hearts = this.hearts.filter(heart => heart.exists);
        
        if (this.enabled && this.game.time.now > this.nextHeartTime) {
            const numHearts = Math.floor(Math.random() * 2) + 10;
            for (let i = 0; i < numHearts; i++) {
                const x = Math.random() * this.game.width;
                const y = -20; // Start above the screen
                let heart = new Heart(this.game, x, y);
                this.hearts.push(heart);
            }
            
            this.nextHeartTime = this.game.time.now + this.heartInterval;
        }
    }
}