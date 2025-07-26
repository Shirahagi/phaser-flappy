const config = {
  type: Phaser.AUTO,
  width: 288,
  height: 512,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let bird;
let pipes;
let score = 0;
let scoreText;
let gameState = 'start'; // 'start', 'playing', 'over'
let pipeSpeed = 100;
let startText;
let logo;
let gameOverText;

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('ground', 'assets/ground.png');
  this.load.image('pipe', 'assets/pipe.png');
  this.load.image('bird', 'assets/bird.png');
  this.load.image('logo', 'assets/logo.png');
  this.load.bitmapFont('flappy', 'assets/font.png', 'assets/font.fnt'); // ✅ 加载位图字体
}

function create() {
  this.add.image(144, 256, 'background');

  const ground = this.physics.add.staticGroup();
  ground.create(144, 512 - 24, 'ground');

  bird = this.physics.add.sprite(50, 256, 'bird')
    .setOrigin(0.5)
    .setCollideWorldBounds(true);

  pipes = this.physics.add.group();

  this.physics.add.collider(bird, ground, hitGround, null, this);
  this.physics.add.overlap(bird, pipes, hitPipe, null, this);

  scoreText = this.add.bitmapText(16, 16, 'flappy', 'SCORE: 0', 32);

  logo = this.add.image(144, 80, 'logo').setOrigin(0.5);

  startText = this.add.bitmapText(144, 200, 'flappy',
    ' \nUse keyborad to\nSelect Speed:\n[1] Slow\n[2] Normal\n[3] Fast\n[4] Faster\n[5] Insane',
    24).setOrigin(0.5).setCenterAlign();

  this.input.keyboard.on('keydown-ONE', () => { pipeSpeed = 100; startGame.call(this); });
  this.input.keyboard.on('keydown-TWO', () => { pipeSpeed = 150; startGame.call(this); });
  this.input.keyboard.on('keydown-THREE', () => { pipeSpeed = 200; startGame.call(this); });
  this.input.keyboard.on('keydown-FOUR', () => { pipeSpeed = 250; startGame.call(this); });
  this.input.keyboard.on('keydown-FIVE', () => { pipeSpeed = 300; startGame.call(this); });
}

function startGame() {
  if (gameState !== 'start') return;
  gameState = 'playing';

  if (logo) logo.setVisible(false);
  startText.setVisible(false);
  if (gameOverText) gameOverText.setVisible(false);

  score = 0;
  scoreText.setText('SCORE: 0');
  bird.setTint(0xffffff);
  bird.setPosition(50, 256);
  pipes.clear(true, true);

  this.time.addEvent({
    delay: 1500,
    callback: addPipes,
    callbackScope: this,
    loop: true
  });

  this.input.on('pointerdown', flap, this);
  this.input.keyboard.on('keydown-SPACE', flap, this);
}

function update() {
  if (gameState === 'playing') {
    if (bird.body.velocity.y > 0) {
      bird.setAngle(20);
    } else {
      bird.setAngle(-20);
    }
  }
}

function flap() {
  if (gameState !== 'playing') return;
  bird.body.velocity.y = -250;
}

function addPipes() {
  const gap = 120;
  const offset = Phaser.Math.Between(-100, 100);

  const topPipe = pipes.create(320, 256 - gap / 2 + offset, 'pipe');
  topPipe.setOrigin(0, 1);
  topPipe.setFlipY(true);
  topPipe.body.allowGravity = false;
  topPipe.body.immovable = true;
  topPipe.body.velocity.x = -pipeSpeed;

  const bottomPipe = pipes.create(320, 256 + gap / 2 + offset, 'pipe');
  bottomPipe.setOrigin(0, 0);
  bottomPipe.body.allowGravity = false;
  bottomPipe.body.immovable = true;
  bottomPipe.body.velocity.x = -pipeSpeed;

  score += 1;
  scoreText.setText('SCORE: ' + score);
}

function hitGround() {
  if (gameState !== 'playing') return;
  this.physics.pause();
  bird.setTint(0xff0000);
  gameOver.call(this);
}

function hitPipe() {
  if (gameState !== 'playing') return;
  this.physics.pause();
  bird.setTint(0xff0000);
  gameOver.call(this);
}

function gameOver() {
  gameState = 'over';

  gameOverText = this.add.bitmapText(144, 200, 'flappy',
    `Game Over\nScore: ${score}\nPress SPACE to Restart`,
    24).setOrigin(0.5).setCenterAlign();

  this.input.keyboard.once('keydown-SPACE', () => {
    this.scene.restart();
    gameState = 'start';
  });
}
