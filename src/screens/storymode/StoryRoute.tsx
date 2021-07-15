import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { getQueryOrDefault } from "../../utils/gameUtils";
import Story from "./Story";

type StoryRouteProps = Omit<RouteComponentProps<never>, "match">;

const StoryRoute: React.FC<StoryRouteProps> = ({ history, location }: StoryRouteProps) => {
  const query = new URLSearchParams(location.search);

  const number = getQueryOrDefault(query.get("lvl"), 5);
  const actual = getQueryOrDefault(query.get("actual"), 0);

  const levelParam = `lvl=${number}`;
  const actualParam = `&actual=${actual}`;

  const search = `?${levelParam}${actualParam}`;

  if (location.search !== search) {
    history.replace(`/story${search}`);
  }

  return <Story number={number} actual={actual} />;
};

export default StoryRoute;
