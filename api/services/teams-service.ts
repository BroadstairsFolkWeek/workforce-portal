import { Effect, Array, Order } from "effect";
import { TeamsRepository } from "../model/teams-repository";

export const getTeamsSortedByDisplayOrder = () =>
  TeamsRepository.pipe(
    Effect.andThen((repo) => repo.modelGetTeams()),
    Effect.andThen(Array.sortWith((t) => t.displayOrder, Order.number))
  );
