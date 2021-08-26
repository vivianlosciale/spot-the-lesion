import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { getQueryNumberOrDefault, getQueryStringOrDefault } from "../../utils/queryUtils";
import Story from "./Story";
import storyTheme from "../games/index";

type StoryRouteProps = Omit<RouteComponentProps<never>, "match">;

const StoryRoute: React.FC<StoryRouteProps> = ({ history, location }: StoryRouteProps) => {
  const query = new URLSearchParams(location.search);

  const actual = getQueryNumberOrDefault(query.get("actual"), 0);
  const theme = getQueryStringOrDefault(query.get("theme"), "Game1");
  const number = storyTheme[theme].level.length;

  const actualParam = `actual=${actual}`;
  const themeParam = `theme=${theme}`;

  const search = `?${themeParam}&${actualParam}`;

  if (location.search !== search) {
    history.replace(`/story${search}`);
  }

  return <Story number={number} actual={actual} theme={theme} />;
};

export default StoryRoute;
