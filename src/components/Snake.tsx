import React, { useEffect } from "react";

// props for type of grid item
interface GridItemProps {
  itemType: number; // 0 = empty, 1 = snake, 2 = food
}

// entry in grid
interface Entry {
  x: number;
  y: number;
}

// directions
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

// screen variables
const GLOBAL_WIDTH = 10;
const GLOBAL_HEIGHT = 10;
const GLOBAL_SPEED = 150; // ms

// grid item component that depends on itemtype. 0 = empty, 1 = snake, 2 = food
const GridItem = ({ itemType }: GridItemProps) => {
  return (
    <div
      style={{
        height: "50px",
        width: "50px",
        margin: "2px",
        backgroundColor:
          itemType === 0 ? "white" : itemType === 1 ? "green" : "red",
        border: "1px solid black",
      }}
    />
  );
};

const Snake = () => {
  // each entry (i,j) is a grid item that is 50px by 50px, with 2px margin

  // boolean representing whether game is over
  const [gameOver, setGameOver] = React.useState<boolean>(false);

  // snake is array representing current boxes that represent the snake
  const [snake, setSnake] = React.useState<Entry[]>([
    { x: 5, y: 1 },
    { x: 5, y: 2 },
    { x: 5, y: 3 },
  ]);

  // score is number of food eaten
  const [score, setScore] = React.useState<number>(0);

  // creates random food
  const randomFood = () => {
    // update food
    let newFood = {
      x: Math.floor(Math.random() * GLOBAL_WIDTH),
      y: Math.floor(Math.random() * GLOBAL_HEIGHT),
    };
    while (newFood.x === snake[0].x && newFood.y === snake[0].y) {
      newFood = {
        x: Math.floor(Math.random() * GLOBAL_WIDTH),
        y: Math.floor(Math.random() * GLOBAL_HEIGHT),
      };
    }
    return newFood;
  };

  // food is a single entry representing the current food
  const [food, setFood] = React.useState<Entry>(randomFood());

  // represents direction of current movement
  const [direction, setDirection] = React.useState<number>(LEFT);

  // function that handles looping entry around the grid
  const loopEntry = (entry: Entry) => {
    if (entry.x === GLOBAL_WIDTH) entry.x = 0;
    if (entry.x === -1) entry.x = GLOBAL_WIDTH - 1;
    if (entry.y === GLOBAL_HEIGHT) entry.y = 0;
    if (entry.y === -1) entry.y = GLOBAL_HEIGHT - 1;
    return entry;
  };
  // updates snake position every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      let newSnake = [...snake];
      let newHead = { x: snake[0].x, y: snake[0].y };
      switch (direction) {
        case UP:
          newHead.x -= 1;
          break;
        case DOWN:
          newHead.x += 1;
          break;
        case LEFT:
          newHead.y -= 1;
          break;
        case RIGHT:
          newHead.y += 1;
          break;
      }
      newHead = loopEntry(newHead);
      newSnake.pop(); // remove tail
      newSnake.unshift(newHead); // add new head
      setSnake(newSnake);
      updateState();
    }, GLOBAL_SPEED);
    return () => clearInterval(interval);
  }, [snake, direction]);

  // handles direction control for keystrokes
  const handleKeyDown = (event: KeyboardEvent) => {
    console.log(direction);
    switch (event.key) {
      case "w":
        // console.log(direction === DOWN);
        if (direction === DOWN) {
          break;
        }
        setDirection(UP);
        break;
      case "s":
        if (direction === UP) break;
        setDirection(DOWN);
        break;
      case "a":
        if (direction === RIGHT) break;
        setDirection(LEFT);
        break;
      case "d":
        console.log("works");
        if (direction === LEFT) break;
        setDirection(RIGHT);
        break;
    }
  };

  // handles keystroke detection
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // handles eating food
  const eatFood = () => {
    // update score
    setScore(score + 1);

    // create new snake piece
    let newSnakePiece = {
      x: -1,
      y: -1,
    };
    if (snake[snake.length - 1].x === snake[snake.length - 2].x) {
      newSnakePiece.x = snake[snake.length - 1].x;
      if (snake[snake.length - 1].y > snake[snake.length - 2].y) {
        newSnakePiece.y = snake[snake.length - 1].y + 1;
      } else {
        newSnakePiece.y = snake[snake.length - 1].y - 1;
      }
    } else if (snake[snake.length - 1].y === snake[snake.length - 2].y) {
      newSnakePiece.y = snake[snake.length - 1].y;
      if (snake[snake.length - 1].x > snake[snake.length - 2].x) {
        newSnakePiece.x = snake[snake.length - 1].x + 1;
      } else {
        newSnakePiece.x = snake[snake.length - 1].x - 1;
      }
    }
    newSnakePiece = loopEntry(newSnakePiece);

    // update snake length
    const newSnake = [...snake, newSnakePiece];
    loopEntry(newSnake[newSnake.length - 1]);
    setSnake(newSnake);

    // update food
    setFood(randomFood());
  };

  // handles updating the state (game over, food eaten, etc.)
  const updateState = () => {
    // if snake head is on food, add new head to snake
    if (snake[0].x === food.x && snake[0].y === food.y) {
      eatFood();
    }
    // if snake head is on snake, game over
    for (let i = 1; i < snake.length; i++) {
      if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
        setGameOver(true);
      }
    }
  };

  // empty grid to render
  const grid = new Array<number[]>(GLOBAL_WIDTH).fill(
    new Array<number>(GLOBAL_HEIGHT).fill(0)
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <p style={{ fontSize: "3em" }}>Snake Game</p>
      <p style={{ fontSize: "2em" }}>
        Use WASD to move. Current score: {score}
      </p>

      {!gameOver ? (
        <div>
          {grid.map((row: number[], i) => {
            return (
              <div style={{ display: "flex" }}>
                {row.map((col, j) => {
                  for (let k = 0; k < snake.length; k++) {
                    if (snake[k].x === i && snake[k].y === j) {
                      return <GridItem itemType={1} />;
                    }
                  }
                  if (food.x === i && food.y === j) {
                    return <GridItem itemType={2} />;
                  }
                  return <GridItem itemType={0} />;
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <h1 style={{ fontSize: "8em" }}>Game Over</h1>

          <p>Refresh page to start new game</p>
        </div>
      )}
    </div>
  );
};

export default Snake;
