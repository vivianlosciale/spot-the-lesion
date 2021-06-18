import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Button, Card } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useSnackbar } from "notistack";
import axios from "axios";
import clsx from "clsx";
import firebase from "firebase/app";
import { NavigationAppBar } from "../../../components";
import StoryGuide from "../StoryGuide";
import { useCanvasContext, useInterval } from "../../../hooks";
import { handleAxiosError } from "../../../utils/axiosUtils";
import {
  drawCross,
  drawRectangle,
  mapClickToCanvas,
  mapRectangleToCanvasScale,
  toCanvasScale,
  toDefaultScale,
} from "../../../utils/canvasUtils";
import { handleImageLoadError, handleUncaughtError } from "../../../utils/errorUtils";
import {
  handleFirebaseStorageError,
  handleFirestoreError,
  isFirebaseStorageError,
  isFirestoreError,
} from "../../../utils/firebaseUtils";
import { drawRoundEndText, getAnnotationPath, getImagePath } from "../../../utils/gameUtils";
import useFileIdGenerator from "../../game/useFileIdGenerator";
import colors from "../../../res/colors";
import constants from "../../../res/constants";
import variables from "../../../res/variables";

interface CustomizedState {
  number: number;
  level: number;
}

const useStyles = makeStyles((theme) =>
  createStyles({
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
    topBarCanvasContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    emptyDiv: {
      flex: 0.2,
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
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
    explanationCard: {
      flex: 0.5,
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

const Game: React.FC<GameProps> = ({ gameMode, difficulty, challengeFileIds }: GameProps) => {
  const history = useHistory();
  const location = useLocation();

  const [fileId, setFileId] = useState(-1);

  const [truth, setTruth] = useState<number[]>([]);
  const [predicted, setPredicted] = useState<number[]>([]);
  const [click, setClick] = useState<{ x: number; y: number } | null>(null);

  const [imageData, setImageData] = useState<FirestoreImageData>({
    ...defaultImageData,
    clicks: [],
  });

  const [roundRunning, setRoundRunning] = useState(false);
  const [roundTime, setRoundTime] = useState(variables.roundDuration);

  const [endRunning, setEndRunning] = useState(false);
  const [endTime, setEndTime] = useState(0);

  const [animationRunning, setAnimationRunning] = useState(false);
  const [animationPosition, setAnimationPosition] = useState(0);

  const [hintedCurrent, setHintedCurrent] = useState(false);

  const [context, canvasRef] = useCanvasContext();
  const [animationContext, animationCanvasRef] = useCanvasContext();

  const canvasContainer = useRef<HTMLDivElement>(null);

  const getNewFileId = useFileIdGenerator(difficulty, challengeFileIds);

  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();

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

      enqueueSnackbar("The system is thinking...", constants.informationSnackbarOptions);

      setAnimationRunning(true);
      setEndRunning(false);
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

        const text = playerCorrect ? "Well spotted!" : "Missed!";
        const textColor = playerCorrect ? colors.playerCorrect : colors.playerIncorrect;

        const textSize = toCanvasScale(context, constants.roundEndTextSize);
        const textLineWidth = toCanvasScale(context, constants.roundEndTextLineWidth);

        drawRoundEndText(context, text, textSize, textLineWidth, textColor);
      } else {
        const textSize = toCanvasScale(context, constants.roundEndTextSize);
        const textLineWidth = toCanvasScale(context, constants.roundEndTextLineWidth);

        drawRoundEndText(context, "Too slow!", textSize, textLineWidth, colors.playerIncorrect);
      }
    }
  }, [
    click,
    context,
    endRunning,
    endTime,
    enqueueSnackbar,
    fileId,
    gameMode,
    hintedCurrent,
    predicted,
    roundTime,
    truth,
    uploadClick,
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

  const next = location.state as CustomizedState;

  const endRound = () => {
    next.level += 1;
    history.replace("/story", next);
  };

  /**
   * Starts a new round, loading a new annotation - image pair
   */
  const startRound = async () => {
    /* Get a new file id and load the corresponding annotation and image */
    const newFileId = getNewFileId();

    try {
      await loadAnnotation(newFileId);
      await loadImage(newFileId);

      setFileId(newFileId);

      /* Reset game state */
      setRoundTime(variables.roundDuration);
      setEndTime(0);
      setAnimationPosition(0);

      setHintedCurrent(false);

      setClick(null);
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
    }
  };

  return (
    <>
      <NavigationAppBar showBack />
      <div className={classes.container}>
        <StoryGuide className={classes.explanationCard} number={next.number} level={next.level} />
        <div className={classes.topBarCanvasContainer}>
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
        <Button
          onClick={startRound}
          className={classes.button}
          variant="contained"
          color="primary"
          size="large"
        >
          Commencer
        </Button>
        <Button
          onClick={endRound}
          className={classes.button}
          variant="contained"
          color="primary"
          size="large"
        >
          Fin niveau
        </Button>
      </div>
    </>
  );
};

export default Game;
