import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Card, Typography } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import clsx from "clsx";

interface ExplanationCardProps {
  explanationItem: ExplanationItem;
  className?: string;
  children?: ReactNode;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
      padding: 24,
      overflowY: "auto",
    },
    textContainer: {
      marginTop: 40,
      display: "flex",
      justifyContent: "center",
    },
    title: {
      textDecoration: "underline",
      [theme.breakpoints.only("xs")]: {
        fontSize: "1.5rem",
      },
      [theme.breakpoints.only("sm")]: {
        fontSize: "1.75rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "2.5rem",
      },
    },
    text: {
      textAlign: "justify",
      [theme.breakpoints.only("xs")]: {
        fontSize: "1.1rem",
      },
      [theme.breakpoints.only("sm")]: {
        fontSize: "1.3rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "1.75rem",
      },
    },
    imageContainer: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
    },
    image: {
      [theme.breakpoints.only("xs")]: {
        maxHeight: "128px",
      },
      [theme.breakpoints.only("sm")]: {
        maxHeight: "192px",
      },
      [theme.breakpoints.up("md")]: {
        maxHeight: "256px",
      },
    },
  })
);

const ExplanationCard = React.forwardRef<JSX.Element, ExplanationCardProps>(
  ({ children, className, explanationItem: { title, body } }, ref) => {
    const { t } = useTranslation("explanation");

    const classes = useStyles();

    return (
      <Card className={clsx(classes.container, className)} ref={ref}>
        <Typography variant="subtitle1" className={classes.title}>
          {t(title)}
        </Typography>
        {Object.keys(body).map((value) => {
          return (
            <div key={value}>
              <div className={classes.textContainer}>
                <Typography className={classes.text}>{t(body[value].text)}</Typography>
              </div>

              <div
                className={classes.imageContainer}
                style={{ display: body[value].imageSrc === undefined ? "none" : "" }}
              >
                <img className={classes.image} src={body[value].imageSrc} alt="Explanation card" />
              </div>
            </div>
          );
        })}
        {children}
      </Card>
    );
  }
);

ExplanationCard.displayName = "ExplanationCard";

export default ExplanationCard;
