import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppBar, Button, Card, IconButton, Toolbar, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { KeyboardBackspace } from "@material-ui/icons";
import { OptionsObject, useSnackbar } from "notistack";
import axios from "axios";
import GameTopBar from "./GameTopBar";
import GameSideBar from "./GameSideBar";
import SubmitScoreDialog from "./SubmitScoreDialog";
import {
  useCanvasContext,
  useUniqueRandomGenerator,
  useInterval,
  useHeatmap,
} from "../../components";
import {
  drawCircle,
  drawCross,
  drawRectangle,
  mapClickToCanvas,
  mapCoordinatesToCanvasScale,
  mapToCanvasScale,
  randomAround,
} from "../../utils/CanvasUtils";
import {
  getImagePath,
  getIntersectionOverUnion,
  getJsonPath,
  unlockAchievement,
} from "../../utils/GameUtils";
import colors from "../../res/colors";
import constants from "../../res/constants";
import DbUtils from "../../utils/DbUtils";
import { db, firebaseStorage } from "../../firebase/firebaseApp";

const useStyles = makeStyles((theme) =>
  createStyles({
    backButton: {
      marginRight: 8,
    },
    title: {
      flexGrow: 1,
    },
    container: {
      height: "100%",
      display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
      },
      [theme.breakpoints.up("md")]: {
        flexDirection: "row",
      },
    },
    emptyDiv: {
      flex: 1,
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
      [theme.breakpoints.up("md")]: {
        display: "block",
      },
    },
    topBarCanvasContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    canvasContainer: {
      display: "grid",
      padding: 8,
      [theme.breakpoints.down("sm")]: {
        height: "80vw",
        width: "80vw",
        maxWidth: "60vh",
        maxHeight: "60vh",
      },
      [theme.breakpoints.up("md")]: {
        height: "70vh",
        width: "70vh",
        maxWidth: "70vw",
        maxHeight: "70vw",
      },
    },
    canvas: {
      gridColumnStart: 1,
      gridRowStart: 1,
      height: "100%",
      width: "100%",
    },
  })
);

/* TODO: error handling for axios and firebase requests */
/* TODO: offline handling */

/* TODO: extract this */
const MAX_CANVAS_SIZE = 750;

const informationSnackbarOptions: OptionsObject = {
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  autoHideDuration: constants.animationTime,
  variant: "info",
};

interface AnnotationData {
  truth: number[];
  predicted: number[];
}

interface ScoreData {
  ai_score: number;
  correct_ai_answers: number;
  correct_player_answers: number;
  day: number;
  month:
    | "Jan"
    | "Feb"
    | "Mar"
    | "Apr"
    | "May"
    | "Jun"
    | "Jul"
    | "Aug"
    | "Sep"
    | "Oct"
    | "Nov"
    | "Dec";
  score: number;
  usedHints: boolean;
  user: string;
  year: number;
}

const Game: React.FC<GameProps> = ({ setRoute, gameMode, MIN_FILE_ID, MAX_FILE_ID }: GameProps) => {
  const classes = useStyles();

  const [context, canvasRef] = useCanvasContext();
  const [animationContext, animationCanvasRef] = useCanvasContext();

  const [inRound, setInRound] = useState(false);
  const [loading, setLoading] = useState(false);

  const [roundRunning, setRoundRunning] = useState(false);
  const [endRunning, setEndRunning] = useState(false);
  const [animationRunning, setAnimationRunning] = useState(false);

  const [roundTime, setRoundTime] = useState(constants.roundTimeInitial);
  const [endTime, setEndTime] = useState(0);
  const [animationPosition, setAnimationPosition] = useState(0);

  const [hinted, setHinted] = useState(false);
  const [hintedAtLeastOnce, setHintedAtLeastOnce] = useState(false);

  const [timerColor, setTimerColor] = useState(colors.timerInitial);

  const getNewFileId = useUniqueRandomGenerator(MIN_FILE_ID, MAX_FILE_ID);
  const [fileId, setFileId] = useState(0);

  const [truth, setTruth] = useState<number[]>([]);
  const [predicted, setPredicted] = useState<number[]>([]);
  const [click, setClick] = useState<{ x: number; y: number } | null>(null);

  const [round, setRound] = useState(0);

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);

  const [playerRoundScore, setPlayerRoundScore] = useState(0);
  const [aiRoundScore, setAiRoundScore] = useState(0);

  const [playerCorrect, setPlayerCorrect] = useState(0);
  const [aiCorrect, setAiCorrect] = useState(0);

  const [playerCorrectCurrent, setPlayerCorrectCurrent] = useState(false);

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  const canvasContainer = useRef<HTMLDivElement>(null);

  useHeatmap(showHeatmap, canvasContainer, fileId, classes.canvas);

  const { enqueueSnackbar } = useSnackbar();

  /**
   * Round timer
   *
   * Decrement roundTime by 100, every 100ms
   *
   * Running only in competitive mode, while roundRunning is true
   */
  useInterval(
    () => setRoundTime((prevState) => prevState - 100),
    roundRunning && gameMode === "competitive" ? 100 : null
  );

  /**
   * Draw the hint circle
   */
  const showHint = useCallback(() => {
    setHinted(true);
    setHintedAtLeastOnce(true);

    const radius = mapToCanvasScale(context, constants.hintRadius);
    const hintRange = mapToCanvasScale(context, constants.hintRange);

    const x = randomAround(Math.round(truth[0] + (truth[2] - truth[0]) / 2), hintRange);
    const y = randomAround(Math.round(truth[1] + (truth[3] - truth[1]) / 2), hintRange);

    drawCircle(context, x, y, radius, constants.hintLineWidth, colors.hint);
  }, [context, truth]);

  /**
   * Round timer based events
   */
  useEffect(() => {
    if (!roundRunning) {
      return;
    }

    /* TODO: think about extracting time constants */
    if (roundTime === 5000) {
      /*
       * 5 seconds left
       *
       * (if not already hinted)
       * set Timer color to timer orange
       * show hint
       */
      if (!hinted) {
        setTimerColor(colors.timerOrange);

        showHint();
      }
    } else if (roundTime === 2000) {
      /*
       * 2 seconds left
       *
       * set Timer color to timer red
       */
      setTimerColor(colors.timerRed);
    } else if (roundTime === 0) {
      /*
       * 0 seconds left
       *
       * start end timer and stop round timer
       */
      setEndRunning(true);
      setRoundRunning(false);
    }
  }, [hinted, roundRunning, roundTime, showHint]);

  /**
   * End timer
   *
   * Increment endTime by 100, every 100ms
   *
   * Running only while endRunning is true
   */
  useInterval(() => setEndTime((prevState) => prevState + 100), endRunning ? 100 : null);

  /**
   * Upload the player click, in order to gather statistics and generate heatmaps
   *
   * @param x Width coordinate
   * @param y Height coordinate
   */
  const uploadPlayerClick = useCallback(
    async (x: number, y: number) => {
      const docNameForImage = `image_${fileId}`;
      let entry;
      let pointWasClickedBefore = false;
      let isClickCorrect = false;

      const newClickPoint = {
        x: Math.round((x * 10000) / context.canvas.width / 100),
        y: Math.round((y * 10000) / context.canvas.height / 100),
        clickCount: 1,
      };

      // Check whether click was correct
      if (truth[0] <= x && x <= truth[2] && truth[1] <= y && y <= truth[3]) {
        isClickCorrect = true;
      }

      const imageDoc = await db.collection(DbUtils.IMAGES).doc(docNameForImage).get();

      if (!imageDoc.exists) {
        // First time this image showed up in the game - entry will be singleton array
        entry = {
          clicks: [newClickPoint],
          correctClicks: isClickCorrect ? 1 : 0,
          wrongClicks: isClickCorrect ? 0 : 1,
          hintCount: hinted ? 1 : 0,
        };
      } else {
        const { clicks, correctClicks, wrongClicks, hintCount } = imageDoc.data()!;
        clicks.forEach((clk: { x: number; y: number; count: number }) => {
          if (clk.x === x && clk.y === y) {
            clk.count += 1;
            pointWasClickedBefore = true;
          }
        });

        if (!pointWasClickedBefore) {
          // First time this clicked occurred for this image, Add to this image's clicks array
          clicks.push(newClickPoint);
        }

        // Construct the updated DB entry for this image
        entry = {
          clicks,
          correctClicks: isClickCorrect ? correctClicks + 1 : correctClicks,
          wrongClicks: isClickCorrect ? wrongClicks : wrongClicks + 1,
          hintCount: hinted ? hintCount + 1 : hintCount,
        };
      }

      await db.collection(DbUtils.IMAGES).doc(docNameForImage).set(entry);
    },
    [context, fileId, hinted, truth]
  );

  /**
   * End timer based events
   */
  useEffect(() => {
    if (!endRunning) {
      return;
    }

    if (endTime === 0) {
      /*
       * 0 seconds passed
       *
       * draw and upload player click (if available)
       * start animation timer and pause end timer
       */
      if (click) {
        const { x, y } = click;

        drawCross(
          context,
          x,
          y,
          constants.clickSize,
          constants.clickLineWidth,
          colors.clickInitial
        );

        /* TODO: handle promise here */
        uploadPlayerClick(x, y).then(() => {});
      }

      /* TODO: maybe remove this snackbar */
      enqueueSnackbar("The system is thinking...", informationSnackbarOptions);

      setAnimationRunning(true);
      setEndRunning(false);
    } else if (endTime === 100) {
      /*
       * 0.1 seconds passed
       *
       * draw predicted rectangle in initial color
       */
      drawRectangle(context, predicted, constants.predictedLineWidth, colors.predictedInitial);
    } else if (endTime === 500) {
      /*
       * 0.5 seconds passed
       *
       * draw truth rectangle
       */
      drawRectangle(context, truth, constants.truthLineWidth, colors.truth);
    } else if (endTime === 1000) {
      /*
       * 1 second passed
       *
       * evaluate player click (if available)
       */
      if (click) {
        const { x, y } = click;

        /* TODO: maybe remove this snackbar */
        enqueueSnackbar("Checking results...", informationSnackbarOptions);

        /* Player was successful if the click coordinates are inside the truth rectangle */
        if (truth[0] <= x && x <= truth[2] && truth[1] <= y && y <= truth[3]) {
          /* Casual Mode: half a point, doubled if no hint received */
          const casualScore = hinted ? 0.5 : 1;

          /* Competitive Mode: function of round time left, doubled if no hint received */
          const competitiveScore = Math.round(roundTime / 100) * (hinted ? 1 : 2);

          setPlayerRoundScore(gameMode === "casual" ? casualScore : competitiveScore);
          setPlayerCorrect((prevState) => prevState + 1);
          setPlayerCorrectCurrent(true);

          drawCross(
            context,
            x,
            y,
            constants.clickSize,
            constants.clickLineWidth,
            colors.clickValid
          );
        } else {
          drawCross(
            context,
            x,
            y,
            constants.clickSize,
            constants.clickLineWidth,
            colors.clickInvalid
          );
        }
      }
    } else if (endTime === 1500) {
      /*
       * 1.5 seconds passed
       *
       * evaluate AI prediction
       * stop end timer
       */
      const intersectionOverUnion = getIntersectionOverUnion(truth, predicted);

      /* AI was successful if the ratio of the intersection over the union is greater than 0.5 */
      if (intersectionOverUnion > 0.5) {
        /* Casual mode: one point */
        const casualScore = 1;

        /* Competitive mode: function of prediction accuracy and constant increase rate */
        const competitiveRoundScore = Math.round(
          intersectionOverUnion * constants.aiScoreMultiplier
        );

        setAiRoundScore(gameMode === "casual" ? casualScore : competitiveRoundScore);
        setAiCorrect((prevState) => prevState + 1);

        drawRectangle(context, predicted, constants.predictedLineWidth, colors.predictedValid);
      } else {
        drawRectangle(context, predicted, constants.predictedLineWidth, colors.predictedInvalid);
      }

      setInRound(false);
      setEndRunning(false);
    }
  }, [
    click,
    context,
    endRunning,
    endTime,
    enqueueSnackbar,
    gameMode,
    hinted,
    predicted,
    roundTime,
    truth,
    uploadPlayerClick,
  ]);

  /**
   * Animation timer
   *
   * Increment animationPosition by 1 (tempo based on set animation time and number of search cubes)
   *
   * Running only while animationRunning is true
   */
  useInterval(
    () => setAnimationPosition((prevState) => prevState + 1),
    animationRunning ? Math.round(constants.animationTime / constants.animationCubes ** 2) : null
  );

  /**
   * Animation timer based events
   */
  useEffect(() => {
    if (!animationRunning) {
      return;
    }

    /* Clear previous cube */
    animationContext.clearRect(0, 0, animationContext.canvas.width, animationContext.canvas.height);

    /* Stop when all cube positions were reached, and resume end timer with one tick passed */
    if (animationPosition === constants.animationCubes ** 2) {
      setAnimationRunning(false);
      setEndTime((prevState) => prevState + 100);
      setEndRunning(true);
      return;
    }

    const cubeSide = animationContext.canvas.width / constants.animationCubes;
    const baseX = (animationPosition % constants.animationCubes) * cubeSide;
    const baseY = Math.floor(animationPosition / constants.animationCubes) * cubeSide;
    const cube = [
      Math.round(baseX),
      Math.round(baseY),
      Math.round(baseX + cubeSide),
      Math.round(baseY + cubeSide),
    ];

    drawRectangle(animationContext, cube, constants.animationLineWidth, colors.animation);
  }, [animationContext, animationPosition, animationRunning]);

  /**
   * After round end based events
   */
  useEffect(() => {
    const unlockAchievementHandler = (key, message) =>
      unlockAchievement(key, message, enqueueSnackbar);

    if (inRound || round === 0) {
      return;
    }

    if (playerCorrectCurrent) {
      unlockAchievementHandler("firstCorrect", "Achievement! First correct answer!");

      if (!hinted) {
        unlockAchievementHandler("firstCorrectWithoutHint", "Achievement! No hint needed!");
      }
    }

    if (gameMode === "casual") {
      if (playerCorrect === 5) {
        unlockAchievementHandler(
          "fiveCorrectSameRunCasual",
          "Achievement! Five correct in same casual run!"
        );
      }
    }

    if (gameMode === "competitive") {
      if (playerCorrectCurrent && roundTime > constants.roundTimeInitial - 2000) {
        unlockAchievementHandler(
          "fastAnswer",
          "Achievement! You answered correctly in less than 2 seconds!"
        );
      }

      if (playerScore + playerRoundScore >= 1000) {
        unlockAchievementHandler(
          "competitivePoints",
          "Achievement! 1000 points in a competitive run!"
        );
      }

      if (playerCorrect === constants.rounds) {
        unlockAchievementHandler("allCorrectCompetitive", "Achievement! You got them all right!");
      }

      if (round === constants.rounds && playerScore + playerRoundScore > aiScore + aiRoundScore) {
        unlockAchievementHandler("firstCompetitiveWin", "Achievement! First competitive win!");
      }
    }
  }, [
    aiRoundScore,
    aiScore,
    enqueueSnackbar,
    gameMode,
    hinted,
    inRound,
    playerCorrect,
    playerCorrectCurrent,
    playerRoundScore,
    playerScore,
    round,
    roundTime,
  ]);

  /**
   * Called when the canvas is clicked
   *
   * @param event Mouse event, used to get click position
   */
  const onCanvasClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!roundRunning) {
      return;
    }

    setClick(mapClickToCanvas(context, event));
    setEndRunning(true);
    setRoundRunning(false);
  };

  /**
   * Loads the data from the json corresponding to the given fileNumber
   *
   * @param fileNumber Number of the json file to load
   */
  const loadJson = async (fileNumber: number) => {
    const jsonStorageReference = firebaseStorage.refFromURL(
      "gs://spot-the-lesion.appspot.com/annotations"
    );

    /* Download the JSON */
    jsonStorageReference
      .child(getJsonPath(fileNumber))
      .getDownloadURL()
      .then((url) => {
        axios.get(url).then((response) => {
          const content: AnnotationData = response.data;
          setTruth(mapCoordinatesToCanvasScale(context, content.truth));
          setPredicted(mapCoordinatesToCanvasScale(context, content.predicted));
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(`Ran into firebase storage error: ${error}`);
      });
  };

  /**
   * Loads the image from the file corresponding to the given fileNumber
   *
   * @param fileNumber
   */
  const loadImage = (fileNumber: number): Promise<void> =>
    new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);

        resolve();
      };

      // Create a reference from a Google Cloud Storage URI
      const imageStorageReference = firebaseStorage.refFromURL(
        "gs://spot-the-lesion.appspot.com/images"
      );

      image.onerror = reject;

      /* Set source after onLoad to ensure onLoad gets called (in case the image is cached) */
      imageStorageReference
        .child(getImagePath(fileNumber))
        .getDownloadURL()
        .then((url) => {
          image.src = url;
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(`Ran into firebase storage error: ${error}`);
        });
    });

  /**
   * Starts a new round, loading a new image and its corresponding JSON data
   */
  const startRound = async () => {
    setLoading(true);
    setInRound(true);

    /* Update scores with last round scores */
    setPlayerScore((prevState) => prevState + playerRoundScore);
    setPlayerRoundScore(0);

    setAiScore((prevState) => prevState + aiRoundScore);
    setAiRoundScore(0);

    setRound((prevState) => prevState + 1);

    /* Get a new file number and load the corresponding json and image */
    const newFileId = getNewFileId();
    setFileId(newFileId);

    await loadJson(newFileId);
    await loadImage(newFileId);

    /* Reset game state */
    setRoundTime(constants.roundTimeInitial);
    setEndTime(0);
    setAnimationPosition(0);

    setHinted(false);
    setTimerColor(colors.timerInitial);

    setClick(null);

    setPlayerCorrectCurrent(false);

    setShowHeatmap(false);

    setRoundRunning(true);
    setLoading(false);
  };

  /**
   * Function for triggering the effects associated with submitting the score
   * Submit button becomes disabled
   * Snackbar triggered
   * Scores uploaded into Firebase
   */
  const submitScore = async (username: string) => {
    const date = new Date();

    const scoreData: ScoreData = {
      user: username,
      score: playerScore + playerRoundScore,
      ai_score: aiScore + aiRoundScore,
      correct_player_answers: playerCorrect,
      usedHints: hintedAtLeastOnce,
      correct_ai_answers: aiCorrect,
      day: date.getDate(),
      month: DbUtils.monthNames[date.getMonth()],
      year: date.getFullYear(),
    };

    const leaderboard =
      gameMode === "casual" ? DbUtils.LEADERBOARD_CASUAL : DbUtils.LEADERBOARD_COMPETITIVE;

    const docName = `${scoreData.year}.${scoreData.month}.${scoreData.day}.${scoreData.user}`;

    const scoreDoc = await db.collection(leaderboard).doc(docName).get();

    /* Set if first time played today, or a higher score was achieved */
    if (!scoreDoc.exists || (scoreDoc.data() as ScoreData).score < scoreData.score) {
      await db.collection(leaderboard).doc(docName).set(scoreData);
    }

    setRoute("home");
    enqueueSnackbar("Score successfully submitted!");
  };

  const onToggleHeatmap = () => setShowHeatmap((prevState) => !prevState);

  const onShowSubmit = () => setShowSubmit(true);

  const onCloseSubmit = () => setShowSubmit(false);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <IconButton
            className={classes.backButton}
            edge="start"
            color="inherit"
            aria-label="Back"
            onClick={() => setRoute("home")}
          >
            <KeyboardBackspace />
          </IconButton>

          <Typography className={classes.title}>Spot the Lesion</Typography>

          <Button color="inherit" disabled={round === 0 || inRound} onClick={onToggleHeatmap}>
            {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
          </Button>
        </Toolbar>
      </AppBar>

      <div className={classes.container}>
        <div className={classes.emptyDiv} />

        <div className={classes.topBarCanvasContainer}>
          <GameTopBar
            gameMode={gameMode}
            hintDisabled={hinted || !roundRunning}
            onHintClick={showHint}
            roundTime={roundTime}
            timerColor={timerColor}
          />

          <Card className={classes.canvasContainer} ref={canvasContainer}>
            <canvas
              className={classes.canvas}
              ref={canvasRef}
              width={MAX_CANVAS_SIZE}
              height={MAX_CANVAS_SIZE}
            />

            <canvas
              className={classes.canvas}
              ref={animationCanvasRef}
              width={MAX_CANVAS_SIZE}
              height={MAX_CANVAS_SIZE}
              onClick={onCanvasClick}
            />
          </Card>
        </div>

        <GameSideBar
          gameMode={gameMode}
          round={round}
          inRound={inRound}
          loading={loading}
          playerScore={playerScore}
          playerRoundScore={playerRoundScore}
          aiScore={aiScore}
          aiRoundScore={aiRoundScore}
          onStartRound={startRound}
          onSubmitClick={onShowSubmit}
        />
      </div>

      <SubmitScoreDialog open={showSubmit} onClose={onCloseSubmit} onSubmit={submitScore} />
    </>
  );
};

export default Game;
