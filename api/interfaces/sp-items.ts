export interface AddableMultiLookupId {
  results: number[];
}

export interface AddableListItem {
  Title: string;
  [x: string]:
    | string
    | number
    | boolean
    | AddableMultiLookupId
    | null
    | undefined;
}

export interface UpdatableListItem extends Partial<AddableListItem> {}

export interface PersistedListItem extends AddableListItem {
  ID: number;
  Created: string;
  Modified: string;
}

export interface OrderBySpec {
  columnName: string;
  direction: "ASC" | "DESC";
}
