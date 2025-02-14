var GameOver = function(game){
    this.heartEmitter = null;
};

GameOver.prototype = {

    create: function(){

        this.game.stage.backgroundColor = '0xFF1493';

        this.quit = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.resume = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.showScore();

        // Initialize heart emitter
        this.heartEmitter = new HeartEmitter(this.game);
        this.heartEmitter.setHeartInterval(1000); // Generate hearts every second
        this.heartEmitter.startAutoGeneration();
    },

    update: function () {
        if (this.heartEmitter) {
            this.heartEmitter.update();
        }

        if (this.resume.isDown) {
            this.restartGame();
        }
        if (this.quit.isDown) {
            // this.quitGame();
        }
    },

    showScore: function () {
		var scoreFont = "70px 'Dancing Script', cursive";
	
		this.scoreLabel = this.game.add.text(
			this.game.world.centerX,
			this.game.world.centerY / 2,
			"0",
			{ font: scoreFont, fill: "0x660000", stroke: "#000", strokeThickness: 5 }
		);
		this.scoreLabel.anchor.setTo(0.5, 0.5);
		this.scoreLabel.align = 'center';
		this.game.world.bringToTop(this.scoreLabel);
		this.scoreLabel.text = "Your score is " + score;
	
		this.highScore = this.game.add.text(
			this.game.world.centerX,
			this.game.world.centerY,
			"0",
			{ font: scoreFont, fill: "0x660000", stroke: "#000", strokeThickness: 5 }
		);
		this.highScore.anchor.setTo(0.5, 0.5);
		this.highScore.align = 'center';
		this.game.world.bringToTop(this.highScore);
	
		this.hs = window.localStorage.getItem('HighScore');
	
		if (this.hs == null || parseInt(this.hs) < score) {
			this.highScore.setText("High score: " + score);
			window.localStorage.setItem('HighScore', score);
		} else {
			this.highScore.setText("High score: " + this.hs);
		}
	
		let specialMessage = "Reach 500 for Special Message \n Press SPACE for a new game";
	
		if(score >= 1500){
			specialMessage = "Oh no! lets have One last push to 2000";
		} else if (score >= 200) {
			specialMessage = "Incredible! 1000 points! Can you reach 1500?";
			setTimeout(() => {
				window.open("special.html", "_blank");
			}, 1000)
		} else if (score >= 100) {
			specialMessage = "Fooled you next milestone is 1000";
			setTimeout(() => {
				window.open("special1.html", "_blank");
			}, 1000)
		}
	
		this.restart = this.game.add.text(
			this.game.world.centerX,
			this.game.world.centerY * 1.6,
			specialMessage,
			{ font: scoreFont, fill: "0x660000", stroke: "#000", strokeThickness: 5 }
		);
		this.restart.anchor.setTo(0.5, 0.5);
		this.restart.align = 'center';
		this.game.world.bringToTop(this.restart);
	},

    restartGame: function(){
        if (this.heartEmitter) {
            this.heartEmitter.stopAutoGeneration();
        }
        this.game.state.start("Main");
    }

}
