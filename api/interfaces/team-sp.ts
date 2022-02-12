import { PersistedListItem } from "./sp-items";

interface TeamListItem {
  Description: string;
}

export type PersistedTeamListItem = PersistedListItem & TeamListItem;
