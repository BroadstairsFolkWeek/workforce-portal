import "isomorphic-fetch";
import { ColumnDefinition } from "@microsoft/microsoft-graph-types";

import { getClient, getSiteBaseApi } from "./services/site-api";
import { createList, getListByDisplayName } from "./services/list-api";

import lists, { PopulateListDef } from "./list-info";

// Create a list if it doesn't exist, but don't create any columns.
// Colums will be added or updated in the updateList function.
async function ensureList(
  applicationsList: PopulateListDef
): Promise<[string, ColumnDefinition[]]> {
  const existingListInfo = await getListByDisplayName(
    applicationsList.displayName
  );
  if (existingListInfo) {
    return existingListInfo;
  }

  await createList(
    applicationsList.displayName,
    applicationsList.description,
    applicationsList.template
  );
  return ensureList(applicationsList);
}

async function updateList(
  listId: string,
  existingColumns: ColumnDefinition[],
  list: PopulateListDef
) {
  const siteBaseApi = await getSiteBaseApi();
  const listBaseApi: string = siteBaseApi + "/lists/" + listId;

  const columns = await list.columns();

  for (const fieldDef of columns) {
    const existingColumn = existingColumns.find(
      (existingColumn) => existingColumn.name === fieldDef.name
    );
    if (existingColumn) {
      console.info(`Updating existing column ${existingColumn.name}`);
      const updateColumnResult = await getClient()
        .api(listBaseApi + "/columns/" + existingColumn.id)
        .patch(fieldDef);
      console.log(updateColumnResult);
    } else {
      console.info(`Creating new column ${fieldDef.name}`);
      const createColumnResult = await getClient()
        .api(listBaseApi + "/columns")
        .post(fieldDef);
      console.log(createColumnResult);
    }
  }
}

async function createLists() {
  for (const list of lists) {
    try {
      const [listId, existingColumns] = await ensureList(list);
      await updateList(listId, existingColumns, list);
    } catch (err) {
      console.error(JSON.stringify(err));
    }
  }
}

createLists();
