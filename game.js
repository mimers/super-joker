function Mario() {
  return {
    'width': 16,
    'height': 40,
    'speedX': 0.3,
    'speedY': 0,
    'x': 0,
    'y': 0,
    'bottom': function() {
      return this.y + this.height;
    },
    'right': function() {
      return this.x + this.width;
    },
    'paint': function(context) {
      context.save();
      var my_gradient = context.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
      my_gradient.addColorStop(0, "gold");
      my_gradient.addColorStop(0.7, "blue");
      my_gradient.addColorStop(1, "green");
      context.fillStyle = my_gradient;
      context.fillRect(this.x, this.y, this.width, this.height);
      context.restore();
      // context.fill();
      // context.fillText("x:\t" + this.x, 0, 180);
      // context.fillText("y:\t" + this.y, 0, 200);
      // context.fillText("speedX:\t" + this.speedX, 0, 40);
      // context.fillText("speedY:\t" + this.speedY, 0, 60);
      // context.fillText("bottom:\t" + this.bottom(), 0, 80);
      // context.fillText("right:\t" + this.right(), 0, 100);
      // context.fillText("game_bg width:" + game_bg.width, 0, 120);
      // context.fillText("game_bg height:" + game_bg.height, 0, 140);
      // context.fillText("game_bg offsetX:" + bg_sence.offsetX, 0, 160);
    }
  }
}
FPS = 60;

key_to_dir = {
  'Right': 'right',
  'Left': 'left',
  'Down': 'down',
  'Up': 'up',
}
/*
path sytax:
[0,1,2,0,3] means:
            __
      __   |  |
   __|  |  |  |
__|     |__|  |

*/

BLOCK_WIDTH = 20;

function BackGround() {
  return {
    'offsetX': 0,
    'path': [],
    'paint': function(context) {
      var begin = Math.floor(this.offsetX / BLOCK_WIDTH);
      var end = begin + Math.ceil(game_bg.width / BLOCK_WIDTH);
      context.save();
      context.translate(-this.offsetX % BLOCK_WIDTH, 0);
      var path_y = 0,
        path_x = 0;
      for (var i = begin; i < end; i++) {
        path_y = game_bg.height - this.path[i] * BLOCK_WIDTH;
        path_x = BLOCK_WIDTH * (i - begin);
        context.lineTo(path_x, path_y);
        context.lineTo(path_x + BLOCK_WIDTH, path_y);
      };
      context.stroke();
      context.restore();
    },
    'getTop': function(a, b) {
      var begin = Math.floor((a + this.offsetX) / BLOCK_WIDTH);
      var end = Math.floor((b + this.offsetX) / BLOCK_WIDTH);
      var top = this.path[begin];
      for (var i = begin + 1; i <= end; i++) {
        if (this.path[i] > top) {
          top = this.path[i];
        };
      };
      return top * BLOCK_WIDTH;
    },
    'init_map': function() {
      for (var i = 0; i < 100; i++) {
        this.path.push(Math.round(Math.random() * 3));
      };
    }
  }
}

function key_press_handler(event) {
  if (event.type == 'keydown') {
    engine.key_press_handler(event);
  } else if (event.type == 'keyup') {
    engine.key_release_handler(event);
  }
  engine.go();
}

function listen_key_event() {
  document.addEventListener('keydown', key_press_handler, false);
  document.addEventListener('keyup', key_press_handler, false);
}

function getLandTopForMari() {

}

function GameEngine() {
  return {

    'key_press_handler': function(event) {
      event.preventDefault();
      if (key_to_dir.hasOwnProperty(event.keyIdentifier)) {
        engine.current_dir[key_to_dir[event.keyIdentifier]] = true;
      };
    },

    'key_release_handler': function(event) {
      event.preventDefault();
      if (key_to_dir.hasOwnProperty(event.keyIdentifier)) {
        engine.current_dir[key_to_dir[event.keyIdentifier]] = false;
      };
    },

    'current_dir': {
      'left': false,
      'right': false,
      'up': false,
      'down': false
    },

    'init': function() {
      listen_key_event();
    },

    'run': function() {
      setInterval(this.go, 1000 / FPS);
    },

    'go': function() {
      var land_top = game_bg.height - bg_sence.getTop(mari.x, mari.x + mari.width);
      if (engine.current_dir.left || engine.current_dir.right) {
        if (engine.current_dir.left) {
          mari.speedX = -3.6;
        }
        if (engine.current_dir.right) {
          mari.speedX = 3.6;
        }
        need_repaint = true;
      } else {
        mari.speedX = 0;
      }
      if (engine.current_dir.up || engine.current_dir.down) {
        if (engine.current_dir.up) {
          // process jump
          if (mari.bottom() >= land_top) {
            mari.speedY = -8.5;
          }
        }
        if (engine.current_dir.down) {
          // mari.speedY = 1;
        }
        need_repaint = true;
      }
      if (mari.bottom() < land_top) {
        //in the air, drop down with gravity
        mari.speedY += 0.5;
      }
      // mari.y += mari.speedY;
      //process collision of mari and bottom
      var target_y = mari.y + mari.speedY;
      if (target_y + mari.height > land_top) {
        //next frame mari will drop over bottom, set him to bottom right now!
        mari.y = land_top - mari.height;
        mari.speedY = 0;
      } else {
        mari.y = target_y;
      }
      //process x-corrdinate movement
      if (mari.speedX > 0) {
        if (mari.x < game_bg.width / 3 * 2) {
          //mari in the middle of game sence now, don't move sence
          mari.x += mari.speedX;
        } else {
          //move the sence only
          bg_sence.offsetX += mari.speedX;
        }
      } else {
        if (mari.x < game_bg.width / 3) {
          //mari in the middle of game sence now, don't move sence
          bg_sence.offsetX += mari.speedX;
        } else {
          //move the sence only
          mari.x += mari.speedX;
        }
      }

      //process land begin-end
      if (bg_sence.offsetX < 0)
        bg_sence.offsetX = 0;
      else if (bg_sence.offsetX + game_bg.width > bg_sence.path.length * BLOCK_WIDTH)
        bg_sence.offsetX = bg_sence.path.length * BLOCK_WIDTH - game_bg.width;
      //process mari x-cordinate collision
      if (mari.x < 0) {
        mari.x = 0;
      } else if (mari.x > game_bg.width) {
        mari.x = game_bg.width;
      }

      game_bg.height = game_bg.clientHeight;
      game_bg.width = game_bg.clientWidth;
      var ctx = game_bg.getContext("2d");
      ctx.clearRect(0, 0, game_bg.width, land_top);
      bg_sence.paint(ctx);
      mari.paint(ctx);
    },
  }
}

mari = new Mario();
bg_sence = new BackGround();
bg_sence.init_map();
engine = new GameEngine();
engine.init();
engine.run();