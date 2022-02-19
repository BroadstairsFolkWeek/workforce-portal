import "isomorphic-fetch";
import { ColumnDefinition } from "@microsoft/microsoft-graph-types";

import { getClient, getSiteBaseApi } from "./services/site-api";
import { createList, getListByDisplayName } from "./services/list-api";

import lists, { PopulateListDef } from "./list-info";
import { exit } from "process";

// Create a list if it doesn't exist, but don't create any columns.
// Columns will be added or updated in the updateList function.
async function ensureList(
  applicationsList: PopulateListDef
): Promise<[string, ColumnDefinition[]]> {
  console.log("Ensuring list exists: " + applicationsList.displayName);
  const existingListInfo = await getListByDisplayName(
    applicationsList.displayName
  );
  if (existingListInfo) {
    console.log("List exists with ID: " + existingListInfo[0]);
    return existingListInfo;
  }

  console.log("List does not exist. Creating...");
  await createList(
    applicationsList.displayName,
    applicationsList.description,
    applicationsList.template
  );
  console.log("List has been creating. Ensuring...");
  return ensureList(applicationsList);
}

async function updateList(
  listId: string,
  existingColumns: ColumnDefinition[],
  list: PopulateListDef
) {
  console.log("Updating list: " + list.displayName + ". ID: " + listId);
  const siteBaseApi = await getSiteBaseApi();
  const listBaseApi: string = siteBaseApi + "/lists/" + listId;

  console.log("Generating column definitions");
  const columns = await list.columns();
  console.log("Got column definitions");

  for (const fieldDef of columns) {
    console.log("Processing column definition: " + fieldDef.name);
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
      exit(1);
    }
  }
}

createLists();
