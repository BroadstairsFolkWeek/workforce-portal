import { PersistedListItem } from "./sp-items";

interface TeamListItem {
  Description: string;
  DisplayOrder: number;
}

export type PersistedTeamListItem = PersistedListItem & TeamListItem;
