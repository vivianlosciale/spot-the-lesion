import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppBar, Button, Card, IconButton, Toolbar, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { KeyboardBackspace } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import axios from "axios";
import { db, firebaseStorage } from "../../firebase/firebaseApp";
import GameTopBar from "./GameTopBar";
import GameSideBar from "./GameSideBar";
import SubmitScoreDialog from "./SubmitScoreDialog";
import {
  useCanvasContext,
  useHeatmap,
  useInterval,
  useUniqueRandomGenerator,
} from "../../components";
import {
  drawCircle,
  drawCross,
  drawRectangle,
  mapClickToCanvas,
  mapCoordinatesToCanvasScale,
  randomAround,
  toCanvasScale,
  toDefaultScale,
} from "../../utils/canvasUtils";
import {
  getAnnotationPath,
  getImagePath,
  getIntersectionOverUnion,
  logImageLoadError,
  unlockAchievement,
} from "../../utils/GameUtils";
import { isAxiosError, logAxiosError } from "../../utils/axiosUtils";
import {
  getMonthName,
  isFirebaseStorageError,
  isFirestoreError,
  logFirebaseStorageError,
  logFirestoreError,
} from "../../utils/firebaseUtils";
import colors from "../../res/colors";
import constants from "../../res/constants";
import DbUtils from "../../utils/DbUtils";
import ImageStatsDialog from "./ImageStatsDialog";

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
      height: "100%",
      width: "100%",
      gridColumnStart: 1,
      gridRowStart: 1,
    },
  })
);

/* TODO: offline handling */

/* TODO: extract this */
const MAX_CANVAS_SIZE = 750;

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

  const [hintedCurrent, setHintedCurrent] = useState(false);

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

  /**
   * Hooks used for Per-Image Stats
   */
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [totalHints, setTotalHints] = useState(0);

  const [showImageStats, setShowImageStats] = useState(false);

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
    setHintedCurrent(true);
    setHinted(true);

    const radius = toCanvasScale(context, constants.hintRadius);
    const hintRange = toCanvasScale(context, constants.hintRange);

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

    if (roundTime === constants.hintTime) {
      /*
       * (if not already hinted this round)
       * set Timer color to timer orange
       * show hint
       */
      if (!hintedCurrent) {
        setTimerColor(colors.timerOrange);

        showHint();
      }
    } else if (roundTime === constants.redTime) {
      /*
       * set Timer color to timer red
       */
      setTimerColor(colors.timerRed);
    } else if (roundTime === 0) {
      /*
       * start end timer and stop round timer
       */
      setEndRunning(true);
      setRoundRunning(false);
    }
  }, [hintedCurrent, roundRunning, roundTime, showHint]);

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
   * @param x       Width coordinate
   * @param y       Height coordinate
   * @param correct Whether click was correct
   */
  const uploadClick = useCallback(
    async (x: number, y: number, correct: boolean) => {
      const newClick = {
        x: toDefaultScale(context, x),
        y: toDefaultScale(context, y),
        clickCount: 1,
      };

      const docName = `image_${fileId}`;

      try {
        const imageDoc = await db.collection(constants.images).doc(docName).get();

        /* Use image data if available, or use default values  */
        const { clicks = [], correctClicks = 0, hintCount = 0, wrongClicks = 0 } = (imageDoc.exists
          ? imageDoc.data()
          : {}) as FirestoreImageData;

        /* Locate (if present) existing click with same coordinates */
        const existingClick = clicks.find((clk) => clk.x === newClick.x && clk.y === newClick.y);

        /* If not found, append to array, otherwise increment clickCount */
        if (existingClick === undefined) {
          clicks.push(newClick);
        } else {
          existingClick.clickCount += 1;
        }

        const imageData = {
          clicks,
          correctClicks: correctClicks + (correct ? 1 : 0),
          wrongClicks: wrongClicks + (correct ? 0 : 1),
          hintCount: hintCount + (hintedCurrent ? 1 : 0),
        };

        await db.collection(constants.images).doc(docName).set(imageData);
      } catch (error) {
        if (isFirestoreError(error)) {
          logFirestoreError(error);
        } else {
          console.error(`Uncaught error in uploadClick:\n ${(error as Error).message}`);
        }
      }
    },
    [context, fileId, hintedCurrent]
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
       * draw player click (if available)
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
      }

      /* TODO: maybe remove this snackbar */
      enqueueSnackbar("The system is thinking...", constants.informationSnackbarOptions);

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
       * (if click available)
       * evaluate click
       * draw click in valid or invalid color
       * upload player click
       */
      if (click) {
        const { x, y } = click;

        /* TODO: maybe remove this snackbar */
        enqueueSnackbar("Checking results...", constants.informationSnackbarOptions);

        /* Player was successful if the click coordinates are inside the truth rectangle */
        const correct = truth[0] <= x && x <= truth[2] && truth[1] <= y && y <= truth[3];

        if (correct) {
          /* Casual Mode: half a point, doubled if no hint received */
          const casualScore = 0.5 * (hintedCurrent ? 1 : 2);

          /* Competitive Mode: function of round time left, doubled if no hint received */
          const competitiveScore = Math.round(roundTime / 100) * (hintedCurrent ? 1 : 2);

          setPlayerRoundScore(gameMode === "casual" ? casualScore : competitiveScore);
          setPlayerCorrect((prevState) => prevState + 1);
          setPlayerCorrectCurrent(true);
        }

        drawCross(
          context,
          x,
          y,
          constants.clickSize,
          constants.clickLineWidth,
          correct ? colors.clickValid : colors.clickInvalid
        );

        uploadClick(x, y, correct).then(() => {
          retrieveImageStats(fileId).then(() => {});
        });
      }
    } else if (endTime === 1500) {
      /*
       * 1.5 seconds passed
       *
       * evaluate AI prediction
       * draw predicted rectangle in valid or invalid color
       * stop end timer and current round
       * retrieve the image stats corresponding to current file if player has not answered
       */
      if (!click) {
        retrieveImageStats(fileId).then(() => {});
      }
      const intersectionOverUnion = getIntersectionOverUnion(truth, predicted);

      /* AI was successful if the ratio of the intersection over the union is greater than 0.5 */
      const correct = intersectionOverUnion > 0.5;

      if (correct) {
        /* Casual mode: one point */
        const casualScore = 1;

        /* Competitive mode: function of prediction accuracy and constant increase rate */
        const competitiveRoundScore = Math.round(
          intersectionOverUnion * constants.aiScoreMultiplier
        );

        setAiRoundScore(gameMode === "casual" ? casualScore : competitiveRoundScore);
        setAiCorrect((prevState) => prevState + 1);
      }

      drawRectangle(
        context,
        predicted,
        constants.predictedLineWidth,
        correct ? colors.predictedValid : colors.predictedInvalid
      );

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
    hintedCurrent,
    predicted,
    roundTime,
    truth,
    uploadClick,
    fileId,
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

    if (round === 0 || inRound) {
      return;
    }

    if (playerCorrectCurrent) {
      unlockAchievementHandler("firstCorrect", "Achievement! First correct answer!");

      if (!hintedCurrent) {
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
    hintedCurrent,
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
   * Loads the annotation data for the given annotationId
   *
   * @param annotationId Number of the annotation to load
   *
   * @return Void promise
   */
  const loadAnnotation = async (annotationId: number) => {
    const annotationRef = firebaseStorage.ref(getAnnotationPath(annotationId));

    const url = await annotationRef.getDownloadURL();

    const response = await axios.get<AnnotationData>(url);

    const annotation = response.data;

    setTruth(mapCoordinatesToCanvasScale(context, annotation.truth));
    setPredicted(mapCoordinatesToCanvasScale(context, annotation.predicted));
  };

  /**
   * Loads the image from for the given imageId
   *
   * @param imageId Number of the image to load
   *
   * @return Void promise
   */
  const loadImage = (imageId: number): Promise<void> =>
    new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);

        resolve();
      };

      image.onerror = (_ev, _src, _line, _col, error) => reject(error);

      /* Set source after onload to ensure onload gets called (in case the image is cached) */

      const imageRef = firebaseStorage.ref(getImagePath(imageId));

      imageRef
        .getDownloadURL()
        .then((url) => {
          image.src = url;
        })
        .catch((error) => reject(error));
    });

  /**
   * Function for retrieving image statistics from Firebase
   * @param fileNumber - index of the image for which we retrieve stats
   */
  const retrieveImageStats = async (fileNumber: number) => {
    const table = DbUtils.IMAGES;
    // Next 4 lines are just for testing the stats on images 1 and 2
    let index = 1;
    if (fileNumber !== 1) {
      index = 2;
    }
    const docName = `image_${index}`;

    const imageDoc = await db.collection(table).doc(docName).get();
    if (imageDoc.exists) {
      setCorrectAnswers(imageDoc.data()!.correctClicks);
      setWrongAnswers(imageDoc.data()!.wrongClicks);
      setTotalHints(imageDoc.data()!.hintCount);
    }
  };

  const createPieChartData = () => {
    return [
      {
        id: "Correct Answers",
        label: "Correct Answers",
        value: correctAnswers,
        color: "hsl(332, 70%, 50%)",
      },
      {
        id: "Wrong Answers",
        label: "Wrong Answers",
        value: wrongAnswers,
        color: "hsl(194, 70%, 50%)",
      },
      {
        id: "Hints",
        label: "Total Hints",
        value: totalHints,
        color: "hsl(124, 43%, 81%)",
      },
    ];
  };

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

    /* Get a new file number and load the corresponding json and image */
    const newFileId = getNewFileId();
    setFileId(newFileId);

    try {
      await loadAnnotation(newFileId);
      await loadImage(newFileId);
    } catch (error) {
      /* Log error for developers */
      console.error(`Annotation/Image load error\n fileId: ${newFileId}`);

      if (isFirebaseStorageError(error)) {
        logFirebaseStorageError(error);
      } else if (isAxiosError(error)) {
        logAxiosError(error);
      } else {
        logImageLoadError(error as Error);
      }

      /* Notify user */
      enqueueSnackbar("Sorry, that failed! Please try again.", constants.errorSnackbarOptions);

      /* Reset state */
      setInRound(false);
      setLoading(false);
    }

    setRound((prevState) => prevState + 1);

    /* Reset game state */
    setRoundTime(constants.roundTimeInitial);
    setEndTime(0);
    setAnimationPosition(0);

    setHintedCurrent(false);
    setTimerColor(colors.timerInitial);

    setClick(null);

    setPlayerCorrectCurrent(false);

    setShowHeatmap(false);

    setRoundRunning(true);
    setLoading(false);
  };

  /**
   * Submit the achieved score for the given username
   * (Over)write if achieved score is greater than stored one, or there is no stored value
   *
   * @param username Player username to identify achieved score
   */
  const submitScore = async (username: string) => {
    const date = new Date();

    const scoreData: FirestoreScoreData = {
      user: username,
      score: playerScore + playerRoundScore,
      ai_score: aiScore + aiRoundScore,
      correct_player_answers: playerCorrect,
      usedHints: hinted,
      correct_ai_answers: aiCorrect,
      day: date.getDate(),
      month: getMonthName(date.getMonth()),
      year: date.getFullYear(),
    };

    const scores = gameMode === "casual" ? constants.scoresCasual : constants.scoresCompetitive;

    const docName = `${scoreData.year}.${scoreData.month}.${scoreData.day}.${scoreData.user}`;

    try {
      const scoreDoc = await db.collection(scores).doc(docName).get();

      /* Set if first time played today, or a higher score was achieved */
      if (!scoreDoc.exists || (scoreDoc.data() as FirestoreScoreData).score < scoreData.score) {
        await db.collection(scores).doc(docName).set(scoreData);
      }
    } catch (error) {
      if (isFirestoreError(error)) {
        logFirestoreError(error);
      } else {
        console.error(`Uncaught error in submitScore\n ${(error as Error).message}`);
      }

      enqueueSnackbar("Sorry, that failed! Please try again.", constants.errorSnackbarOptions);
    }

    enqueueSnackbar("Score successfully submitted!", constants.successSnackbarOptions);

    setRoute("home");
  };

  const onToggleHeatmap = () => setShowHeatmap((prevState) => !prevState);

  const onShowSubmit = () => setShowSubmit(true);

  const onCloseSubmit = () => setShowSubmit(false);

  const onShowImageStats = () => setShowImageStats(true);

  const onCloseImageStats = () => setShowImageStats(false);

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

          <Button color="inherit" disabled={round === 0 || inRound} onClick={onShowImageStats}>
            Show Image Stats
          </Button>

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
            hintDisabled={hintedCurrent || !roundRunning}
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

      <ImageStatsDialog
        open={showImageStats}
        data={createPieChartData()}
        onClose={onCloseImageStats}
      />
    </>
  );
};

export default Game;
