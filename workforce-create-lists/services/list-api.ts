import { ColumnDefinition, ListInfo } from "@microsoft/microsoft-graph-types";
import { getClient, getSiteBaseApi } from "./site-api";

export async function getListByDisplayName(
  displayName: string
): Promise<[string, ColumnDefinition[]] | null> {
  const siteBaseApi = await getSiteBaseApi();

  try {
    const existingList = await getClient()
      .api(
        siteBaseApi +
          "/lists/" +
          displayName +
          "?expand=columns(select=id,name)"
      )
      .get();
    console.info(`List ${displayName} exists with ID: ${existingList.id}.`);
    return [existingList.id, existingList["columns"]];
  } catch (existingListErr) {
    if (
      existingListErr.statusCode === 404 &&
      existingListErr.code === "itemNotFound"
    ) {
      console.info(`List ${displayName} does not exist.`);
      return null;
    } else {
      console.error(existingListErr);
      throw existingListErr;
    }
  }
}

export async function createList(
  displayName: string,
  description: string,
  template: ListInfo["template"] = "genericList"
) {
  const siteBaseApi = await getSiteBaseApi();

  const requestBody = {
    displayName,
    description,
    list: {
      hidden: false,
      template,
    },
  };

  await getClient()
    .api(siteBaseApi + "/lists")
    .post(requestBody);
}
