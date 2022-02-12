import { PersistedListItem } from "./sp-items";

interface TeamListItem {
  Description: string;
  DisplayOrder: number;
  Requirements: string;
}

export type PersistedTeamListItem = PersistedListItem & TeamListItem;
