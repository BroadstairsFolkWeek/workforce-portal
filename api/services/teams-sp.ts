import { OrderBySpec } from "../interfaces/sp-items";
import { Team } from "../interfaces/team";
import { PersistedTeamListItem } from "../interfaces/team-sp";
import { getWorkforcePortalConfig } from "./configuration-service";
import { applyToItemsByFilter } from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const teamsListGuid = workforcePortalConfig.spTeamsListGuid;

export const getTeamsByFilters = async (
  filter?: string,
  orderBy?: OrderBySpec[]
): Promise<Team[]> => {
  return applyToItemsByFilter<PersistedTeamListItem, Team>(
    workforceSiteUrl,
    teamsListGuid,
    (items: PersistedTeamListItem[]) => {
      return Promise.resolve(items.map(listItemToTeam));
    },
    filter,
    orderBy
  );
};

const listItemToTeam = (item: PersistedTeamListItem): Team => {
  return {
    team: item.Title,
    description: item.Description,
    displayOrder: item.DisplayOrder,
    dbId: item.ID,
  };
};

export const getTeamByName = async (teamName: string): Promise<Team | null> => {
  const teams = await getTeamsByFilters(`Title eq '${teamName}'`);
  if (teams?.length) {
    return teams[0];
  } else {
    return null;
  }
};

export const getAllTeams = async (): Promise<Team[]> => {
  return getTeamsByFilters(undefined, [
    { columnName: "DisplayOrder", direction: "ASC" },
  ]);
};
