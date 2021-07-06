import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import clsx from "clsx";
import firebase from "firebase/app";
import LesionAdventure from "./AdventureItems";
import { LoadingButton, NavigationAppBar } from "../../../../components";
import { useCanvasContext, useHeatmap, useInterval } from "../../../../hooks";
import StoryGuide from "../../StoryGuide";
import { handleAxiosError } from "../../../../utils/axiosUtils";
import {
  drawCircle,
  drawCross,
  drawRectangle,
  mapClickToCanvas,
  mapRectangleToCanvasScale,
  toCanvasScale,
  toDefaultScale,
} from "../../../../utils/canvasUtils";
import { handleImageLoadError, handleUncaughtError } from "../../../../utils/errorUtils";
import {
  handleFirebaseStorageError,
  handleFirestoreError,
  isFirebaseStorageError,
  isFirestoreError,
} from "../../../../utils/firebaseUtils";
import {
  drawRoundEndText,
  getAnnotationPath,
  getImagePath,
  getIntersectionOverUnion,
} from "../../../../utils/gameUtils";
import { randomAround } from "../../../../utils/numberUtils";
import GameTopBar from "../freemode/GameTopBar";
import GameSideBar from "./GameSideBar";
import ImageStatsDialog from "../freemode/ImageStatsDialog";
import useFileIdGenerator from "../freemode/useFileIdGenerator";
import colors from "../../../../res/colors";
import constants from "../../../../res/constants";
import variables from "../../../../res/variables";

interface CustomizedState {
  number: number;
  actual: number;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        justifyContent: "space-between",
      },
      [theme.breakpoints.up("md")]: {
        flexDirection: "row",
        justifyContent: "space-evenly",
      },
    },
    topBarCanvasContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    canvasContainer: {
      position: "relative",
      padding: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
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
      position: "absolute",
      left: 0,
      top: 0,
    },
    imageCanvas: {
      zIndex: 0,
    },
    animationCanvas: {
      zIndex: 1,
    },
    heatmapCanvas: {
      zIndex: 2,
    },
    explanationCard: {
      flex: 1,
      margin: 10,
    },
    button: {
      margin: "5px",
    },
  })
);

const defaultImageData: FirestoreImageData = {
  clicks: [],
  correctClicks: 0,
  hintCount: 0,
  wrongClicks: 0,
};

const LesionGame: React.FC = () => {
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [imageStatsDialogOpen, setImageStatsDialogOpen] = useState(false);

  const [roundNumber, setRoundNumber] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const [fileId, setFileId] = useState(-1);

  const [truth, setTruth] = useState<number[]>([]);
  const [predicted, setPredicted] = useState<number[]>([]);
  const [click, setClick] = useState<{ x: number; y: number } | null>(null);

  const [hideExplanation, setHideExplanation] = useState(true);
  const [mascotExplanation, setMascotExplanation] = useState<MascotExplanation>();
  const [level, setLevel] = useState<AdventureEdition>();
  const [aiVisibility, setAiVisibility] = useState(false);
  const [pointRequirement, setPointRequirement] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const [imageData, setImageData] = useState<FirestoreImageData>({
    ...defaultImageData,
    clicks: [],
  });

  const [roundLoading, setRoundLoading] = useState(false);
  const [roundEnded, setRoundEnded] = useState(false);
  const [showIncrement, setShowIncrement] = useState(false);

  const [roundRunning, setRoundRunning] = useState(false);
  const [roundTime, setRoundTime] = useState(variables.roundDuration);

  const [endRunning, setEndRunning] = useState(false);
  const [endTime, setEndTime] = useState(0);

  const [animationRunning, setAnimationRunning] = useState(false);
  const [animationPosition, setAnimationPosition] = useState(0);

  const [timerColor, setTimerColor] = useState(colors.timerInitial);

  const [hintedCurrent, setHintedCurrent] = useState(false);

  const [playerScore, setPlayerScore] = useState({ total: 0, round: 0 });
  const [playerCorrectAnswers, setPlayerCorrectAnswers] = useState(0);

  const [aiScore, setAiScore] = useState({ total: 0, round: 0 });
  const [, setAiCorrectAnswers] = useState(0);

  const [context, canvasRef] = useCanvasContext();
  const [animationContext, animationCanvasRef] = useCanvasContext();

  const canvasContainer = useRef<HTMLDivElement>(null);

  const getNewFileId = useFileIdGenerator(difficulty, undefined);

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();

  const location = useLocation();

  const classes = useStyles();

  const next = location.state as CustomizedState;

  // setUp difficulty, point requirement, AI from the file adventuregame lesion
  useEffect(() => {
    for (let i = 0; i < LesionAdventure.length; i++) {
      if (next.actual === Math.round(LesionAdventure[i].level * (next.number - 1))) {
        setLevel(LesionAdventure[i]);
        break;
      }
    }
    /* eslint-disable */
    console.log(level);
    if (level) {
      setDifficulty(level.difficulty);
      setAiVisibility(level.AI);
      setPointRequirement(level.pointRequirement);
      setMascotExplanation(level.mascot);
    }
  }, [next.actual, next.number, level]);
  /**
   * Draw the hint circle
   */
  const drawHint = useCallback(() => {
    setHintedCurrent(true);

    const radius = toCanvasScale(context, variables.hintRadius);
    const hintRange = toCanvasScale(context, constants.hintRange);

    const x = randomAround(Math.round(truth[0] + (truth[2] - truth[0]) / 2), hintRange);
    const y = randomAround(Math.round(truth[1] + (truth[3] - truth[1]) / 2), hintRange);

    drawCircle(context, x, y, radius, variables.hintLineWidth, colors.hint);
  }, [context, truth]);

  /**
   * End timer
   *
   * Increment endTime by 100, every 100ms
   *
   * Running only while endRunning is true
   */
  useInterval(() => setEndTime((prevState) => prevState + 100), endRunning ? 100 : null);

  /**
   * Upload the player click in order to gather statistics and generate heatmaps
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

      const { clicks, correctClicks, hintCount, wrongClicks } = imageData;

      /* Locate (if present) existing click with same coordinates */
      const existingClick = clicks.find((clk) => clk.x === newClick.x && clk.y === newClick.y);

      /* If not found, append to array, otherwise increment clickCount */
      if (existingClick === undefined) {
        clicks.push(newClick);
      } else {
        existingClick.clickCount += 1;
      }

      const docName = fileId.toString();

      const newImageData = {
        clicks,
        correctClicks: correctClicks + (correct ? 1 : 0),
        wrongClicks: wrongClicks + (correct ? 0 : 1),
        hintCount: hintCount + (hintedCurrent ? 1 : 0),
      };

      try {
        await firebase
          .firestore()
          .collection(constants.images(difficulty))
          .doc(docName)
          .set(newImageData);
      } catch (error) {
        if (isFirestoreError(error)) {
          handleFirestoreError(error);
        } else {
          handleUncaughtError(error, "uploadClick");
        }
      }
    },
    [context, difficulty, fileId, hintedCurrent, imageData]
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

        const clickSize = toCanvasScale(context, constants.clickSize);
        const clickLineWidth = toCanvasScale(context, constants.clickLineWidth);

        drawCross(context, x, y, clickSize, clickLineWidth, colors.click);
      }

      if (aiVisibility) {
        enqueueSnackbar("The system is thinking...", constants.informationSnackbarOptions);

        setAnimationRunning(true);
        setEndRunning(false);
      }
    } else if (endTime === constants.drawPredictedTime) {
      /*
       * draw predicted rectangle
       */
      const predictedLineWidth = toCanvasScale(context, constants.predictedLineWidth);

      drawRectangle(context, predicted, predictedLineWidth, colors.predicted);
    } else if (endTime === constants.drawTruthTime) {
      /*
       * draw truth rectangle
       */
      const truthLineWidth = toCanvasScale(context, constants.truthLineWidth);

      drawRectangle(context, truth, truthLineWidth, colors.truth);
    } else if (endTime === constants.evaluationTime) {
      /*
       * evaluate player
       * upload player click
       * draw round end text
       * evaluate AI
       * retrieve image statistics
       * stop end timer
       * end round
       */
      enqueueSnackbar("Checking results...", constants.informationSnackbarOptions);

      if (click) {
        const { x, y } = click;

        /* Player was successful if the click coordinates are inside the truth rectangle */
        const playerCorrect = truth[0] <= x && x <= truth[2] && truth[1] <= y && y <= truth[3];

        uploadClick(x, y, playerCorrect).then(() => {});

        if (playerCorrect) {
          /* Casual Mode: half a point, doubled if no hint received */
          const roundScore = 0.5 * (hintedCurrent ? 1 : 2);

          setPlayerScore(({ total }) => ({ total, round: roundScore }));
          setPlayerCorrectAnswers((prevState) => prevState + 1);
        }

        const text = playerCorrect ? "Well spotted!" : "Missed!";
        const textColor = playerCorrect ? colors.playerCorrect : colors.playerIncorrect;

        const textSize = toCanvasScale(context, constants.roundEndTextSize);
        const textLineWidth = toCanvasScale(context, constants.roundEndTextLineWidth);

        drawRoundEndText(context, text, textSize, textLineWidth, textColor);
      }

      const intersectionOverUnion = getIntersectionOverUnion(truth, predicted);

      /* AI was successful if the ratio of the intersection over the union is greater than 0.5 */
      const aiCorrect = intersectionOverUnion > 0.5;

      if (aiCorrect) {
        /* Casual mode: one point */
        const roundScore = 1;

        setAiScore(({ total }) => ({ total, round: roundScore }));
        setAiCorrectAnswers((prevState) => prevState + 1);
      }

      setRoundEnded(true);
      setEndRunning(false);
    }
  }, [
    click,
    context,
    endRunning,
    endTime,
    enqueueSnackbar,
    hintedCurrent,
    predicted,
    truth,
    uploadClick,
    aiVisibility,
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
    animationRunning
      ? Math.round(variables.animationDuration / constants.animationCubesNumber ** 2)
      : null
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
    if (animationPosition === constants.animationCubesNumber ** 2) {
      setAnimationRunning(false);
      setEndTime((prevState) => prevState + 100);
      setEndRunning(true);
      return;
    }

    const cubeSide = animationContext.canvas.width / constants.animationCubesNumber;
    const baseX = (animationPosition % constants.animationCubesNumber) * cubeSide;
    const baseY = Math.floor(animationPosition / constants.animationCubesNumber) * cubeSide;
    const cube = [
      Math.round(baseX),
      Math.round(baseY),
      Math.round(baseX + cubeSide),
      Math.round(baseY + cubeSide),
    ];

    const animationLineWidth = toCanvasScale(animationContext, constants.animationLineWidth);

    drawRectangle(animationContext, cube, animationLineWidth, colors.animation);
  }, [animationContext, animationPosition, animationRunning]);

  /**
   * Round end based events
   */
  useEffect(() => {
    if (!roundEnded || roundLoading) {
      return;
    }

    setShowIncrement(true);
    if (playerCorrectAnswers >= pointRequirement) {
      setGameEnded(true);
    }
  }, [playerCorrectAnswers, roundEnded, roundLoading, pointRequirement]);

  /**
   * Firestore image document listener
   */
  useEffect(() => {
    if (fileId === -1) {
      return () => {};
    }
    setImageData({ ...defaultImageData, clicks: [] });

    const docName = fileId.toString();

    const unsubscribe = firebase
      .firestore()
      .collection(constants.images(difficulty))
      .doc(docName)
      .onSnapshot(
        (snapshot) => {
          if (snapshot.exists) {
            setImageData(snapshot.data() as FirestoreImageData);
          }
        },
        (error) => handleFirestoreError(error)
      );

    return () => unsubscribe();
  }, [difficulty, fileId]);

  /**
   * Called when the canvas is clicked
   *
   * @param event Mouse event, used to get click position
   */
  const onCanvasClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!roundRunning) {
      return;
    }

    setClick(mapClickToCanvas(context, event.clientX, event.clientY));
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
  const loadAnnotation = async (annotationId: number): Promise<void> => {
    const url = await firebase
      .storage()
      .ref(getAnnotationPath(annotationId, difficulty))
      .getDownloadURL();

    const response = await axios.get<AnnotationData>(url, { timeout: constants.axiosTimeout });

    const annotation = response.data;

    setTruth(mapRectangleToCanvasScale(context, annotation.truth));
    setPredicted(mapRectangleToCanvasScale(context, annotation.predicted));
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
      firebase
        .storage()
        .ref(getImagePath(imageId, difficulty))
        .getDownloadURL()
        .then((url) => {
          image.src = url;
        })
        .catch((error) => reject(error));
    });
  const endRound = () => {
    next.actual += 1;
    history.replace(`/story?lvl=${next.number}&actual=${next.actual}`);
  };

  /**
   * Check if there is some explanation to show to the user
   */
  /* eslint-disable */
  const findExplanation = () => {
    if (level && level.mascot) {
      setHideExplanation(false);
    }
  };

  /**
   * Starts a new round, loading a new annotation - image pair
   */
  const startRound = async () => {
    findExplanation();

    setRoundLoading(true);

    setShowIncrement(false);

    setPlayerScore(({ total, round }) => ({ total: total + round, round: 0 }));
    setAiScore(({ total, round }) => ({ total: total + round, round: 0 }));

    /* Get a new file id and load the corresponding annotation and image */
    const newFileId = getNewFileId();

    try {
      await loadAnnotation(newFileId);
      await loadImage(newFileId);

      setFileId(newFileId);

      setRoundNumber((prevState) => prevState + 1);

      /* Reset game state */
      setRoundTime(variables.roundDuration);
      setEndTime(0);
      setAnimationPosition(0);

      setHintedCurrent(false);
      setTimerColor(colors.timerInitial);

      setClick(null);

      setShowHeatmap(false);

      setRoundEnded(false);
      setRoundRunning(true);
    } catch (error) {
      console.error(`Annotation/Image load error\n fileId: ${newFileId}`);

      if (isFirebaseStorageError(error)) {
        handleFirebaseStorageError(error, enqueueSnackbar);
      } else if (axios.isAxiosError(error)) {
        handleAxiosError(error, enqueueSnackbar);
      } else {
        handleImageLoadError(error, enqueueSnackbar);
      }
    } finally {
      setRoundLoading(false);
    }
  };

  /**
   * Load the data to display on the given heatmap instance
   *
   * @param instance Heatmap instance
   */
  const loadHeatmapData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (instance: any) => {
      setHeatmapLoading(true);

      // eslint-disable-next-line no-underscore-dangle
      const { ctx }: { ctx: CanvasRenderingContext2D } = instance._renderer;

      const min = 0;
      let max = 0;

      const data = imageData.clicks.map(({ x, y, clickCount }) => {
        max = Math.max(max, clickCount);

        return { x: toCanvasScale(ctx, x), y: toCanvasScale(ctx, y), clickCount };
      });

      const heatmapData = { min, max, data };

      instance.setData(heatmapData);

      setHeatmapLoading(false);
    },
    [imageData.clicks]
  );

  const onToggleHeatmap = () => {
    setHeatmapLoading(!showHeatmap);
    setShowHeatmap((prevState) => !prevState);
  };

  const onImageStatsClick = () => setImageStatsDialogOpen(true);

  const onImageStatsClose = () => setImageStatsDialogOpen(false);

  useHeatmap(
    showHeatmap,
    loadHeatmapData,
    canvasContainer,
    `${classes.canvas} ${classes.heatmapCanvas}`
  );

  return (
    <>
      <NavigationAppBar showBack>
        <Button color="inherit" disabled={!roundEnded || roundLoading} onClick={onImageStatsClick}>
          Show Image Stats
        </Button>

        <LoadingButton
          color="inherit"
          disabled={!roundEnded || roundLoading}
          loading={heatmapLoading}
          onClick={onToggleHeatmap}
        >
          {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
        </LoadingButton>
      </NavigationAppBar>

      <div className={classes.container}>
        {mascotExplanation ? (
          <StoryGuide
            className={classes.explanationCard}
            hide={hideExplanation}
            mascotExplanation={mascotExplanation}
            theme={0}
          />
        ) : (
          <div className={classes.explanationCard} />
        )}

        <div className={classes.topBarCanvasContainer}>
          <GameTopBar
            gameMode="casual"
            hintDisabled={hintedCurrent || !roundRunning}
            onHintClick={drawHint}
            roundTime={roundTime}
            timerColor={timerColor}
          />

          <Card className={classes.canvasContainer} ref={canvasContainer}>
            <canvas
              className={clsx(classes.canvas, classes.imageCanvas)}
              ref={canvasRef}
              height={constants.canvasSize}
              width={constants.canvasSize}
            />

            <canvas
              className={clsx(classes.canvas, classes.animationCanvas)}
              ref={animationCanvasRef}
              height={constants.canvasSize}
              width={constants.canvasSize}
              onClick={onCanvasClick}
            />
          </Card>
        </div>

        <GameSideBar
          gameMode="casual"
          onLevelFinished={endRound}
          gameStarted={roundNumber > 0}
          gameEnded={gameEnded}
          roundEnded={roundEnded}
          roundLoading={roundLoading}
          showIncrement={showIncrement}
          onStartRound={startRound}
          playerScore={playerScore}
          aiScore={aiScore}
          showAi={aiVisibility}
        />
      </div>
      <ImageStatsDialog
        open={imageStatsDialogOpen}
        onClose={onImageStatsClose}
        imageData={imageData}
      />
    </>
  );
};

export default LesionGame;
