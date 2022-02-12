import { Team } from "../interfaces/team";
import { getAllTeams } from "./teams-sp";

export const getTeams = async (): Promise<Team[]> => {
  return getAllTeams();
};
