var game = new Phaser.Game(370, 550, Phaser.CANVAS, 'game');

var background, character, pipeSegments;
var spaceBar, pointer;
var points, textPoints;

var mainState = 
{
    preload: function()
    {
        game.load.image('background', 'assets/bg.jpeg');
        game.load.spritesheet('bird', 'assets/bird_spritesheet.png', 43, 30);
        game.load.image('pipe_segment', 'assets/pipe_segment.png');
    },

    create: function()
    {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        background = game.add.tileSprite(0, 0, 370, 550, 'background');
        character = game.add.sprite(150, 225, 'bird');
        character.animations.add('fly', [0, 1, 2], 10, true);
        game.physics.arcade.enable(character);
        character.body.gravity.y = 1200;

        pipeSegments = game.add.group();
        pipeSegments.enableBody = true;
        pipeSegments.createMultiple(20, 'pipe_segment');

        game.time.events.loop(2000, this.createPipe, this);

        spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        pointer = game.input.activePointer;

        points = 0;
        textPoints = game.add.text(0, 500, "Points: 0", {font:"bold 16px arial", fill:"black", align:"left"});
    },
    
    update: function()
    {
        if (!character.inWorld || character.position.y > 460)
        {
            game.state.start('gameOver');
        } else {
            background.tilePosition.x--;
            character.animations.play('fly');
            if (game.physics.arcade.overlap(character, pipeSegments))
                game.state.start('gameOver');

            if (spaceBar.isDown || pointer.isDown || (!pointer.isMouse && pointer.active))
            {
                character.body.velocity.y = -350;
            }
        }
    }, 

    createPipe: function()
    {
        var gap = Math.floor(Math.random() * 4 + 1);
        for (var i = 0; i < 8; i++)
        {
            if (i != gap && i != gap+1 && i != gap+2)
            {
                this.createPipeSegment(370, i*55 + 20);
            }
        }

        points += 1;
        textPoints.text = "Points: " + points;
    },

    createPipeSegment: function(x, y)
    {
        var pipeSegment = pipeSegments.getFirstDead();
        pipeSegment.reset(x, y);
        pipeSegment.body.velocity.x = -150;
        pipeSegment.checkWorldBounds = true;
        pipeSegment.outOfBoundsKill = true;
    }
};

var gameOverState = 
{
    create: function()
    {
        if (localStorage.getItem('highScore') === null)
            localStorage.setItem('highScore', points);
        else if (points > localStorage.getItem('highScore'))
            localStorage.setItem('highScore', points);            
        game.stage.backgroundColor = "#FFF";
        var text = game.add.text(game.width/2, game.height/2 - 50, "Game over", {font: "bold 30px arial", fill: "black", align:"center"});
        text.anchor.setTo(0.5);
        text = game.add.text(game.width/2, game.height/2, "You got " + points + " points", {font: "bold 20px arial", fill: "black", align:"center"});
        text.anchor.setTo(0.5);
        text = game.add.text(game.width/2, game.height/2 + 25, "High score: " + localStorage.getItem('highScore') + " points", {font: "bold 20px arial", fill: "black", align:"center"});
        text.anchor.setTo(0.5);
        text = game.add.text(game.width/2, game.height/2 + 50, "Click or touch the screen to play again", {font: "bold 20px arial", fill: "black", align:"center"});
        text.anchor.setTo(0.5);
    },

    update: function()
    {
        if (spaceBar.isDown || pointer.isDown || (!pointer.isMouse && pointer.active))
        {
            game.state.start('main');
        }
    }
};

game.state.add('main', mainState);
game.state.add('gameOver', gameOverState);
game.state.start('main');