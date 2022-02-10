import { sp } from "@pnp/sp-commonjs/presets/all";
import { Web } from "@pnp/sp-commonjs/webs";
import { IItemAddResult, IItemUpdateResult } from "@pnp/sp-commonjs/items";
import { IFolderInfo } from "@pnp/sp-commonjs/folders";
import { SPFetchClient } from "@pnp/nodejs-commonjs";
import { getWorkforcePortalConfig } from "./configuration-service";
import { UpdatableListItem } from "../interfaces/sp-items";
import { Readable } from "stream";

const workforcePortalConfig = getWorkforcePortalConfig();

const siteUrl: string = workforcePortalConfig.spSiteUrl;
const clientId: string = workforcePortalConfig.spClientId;
const clientSecret: string = workforcePortalConfig.spClientSecret;

sp.setup({
  sp: {
    fetchClientFactory: () => {
      return new SPFetchClient(siteUrl, clientId, clientSecret);
    },
  },
});

export const createItem = async <T>(
  site: string,
  listGuid: string,
  item: T
): Promise<IItemAddResult> => {
  const web = Web(site);
  const list = web.lists.getById(listGuid);
  return list.items.add(item);
};

export const updateItem = async <T extends UpdatableListItem>(
  site: string,
  listGuid: string,
  itemId: number,
  item: T
): Promise<IItemUpdateResult> => {
  const web = Web(site);
  const list = web.lists.getById(listGuid);
  return list.items.getById(itemId).update(item);
};

export const deleteItem = async (
  site: string,
  listGuid: string,
  itemId: number
): Promise<void> => {
  const web = Web(site);
  const list = web.lists.getById(listGuid);
  return list.items.getById(itemId).delete();
};

const getPagedItemsdByFilter = async <T>(
  site: string,
  listGuid: string,
  filter?: string
) => {
  const web = Web(site);
  let itemsQuery = web.lists.getById(listGuid).items;
  if (filter) {
    itemsQuery = itemsQuery.filter(filter);
  }

  return await itemsQuery.getPaged<T[]>();
};

export const applyToPagedItemsdByFilter = async <T, U>(
  site: string,
  listGuid: string,
  callback: (items: T[]) => Promise<U>,
  filter?: string,
  doPaging: boolean = true
): Promise<U> => {
  let retVal: U;
  let pagedItems = await getPagedItemsdByFilter<T>(site, listGuid, filter);
  retVal = await callback(pagedItems.results);

  while (doPaging && pagedItems.hasNext) {
    pagedItems = await pagedItems.getNext();
    retVal = await callback(pagedItems.results);
  }
  return retVal;
};

export const applyToItemsByFilter = async <T, U>(
  site: string,
  listGuid: string,
  callback: (items: T[]) => Promise<U>,
  filter?: string
) => {
  return applyToPagedItemsdByFilter(site, listGuid, callback, filter, false);
};

export const createFolder = async (
  site: string,
  libraryTitle: string,
  folderName: string
): Promise<string> => {
  const web = Web(site);
  const library = web.lists.getByTitle(libraryTitle);
  const folder = await library.rootFolder.addSubFolderUsingPath(folderName);
  return folder.serverRelativeUrl();
};

export const isFolderExists = async (
  site: string,
  libraryTitle: string,
  folderName: string
): Promise<[true, string] | [false]> => {
  const web = Web(site);
  const library = web.lists.getByTitle(libraryTitle);
  try {
    const folder: IFolderInfo = await library.rootFolder.folders
      .getByName(folderName)
      .select("Exists", "ServerRelativeUrl")
      .get();
    if (folder.Exists) {
      return [true, folder.ServerRelativeUrl];
    } else {
      return [false];
    }
  } catch (e) {
    return [false];
  }
};

export const isFileinFolderExists = async (
  site: string,
  folderServerRelativePath: string,
  filename: string
): Promise<[true, string] | [false]> => {
  const web = Web(site);

  try {
    const file = await web
      .getFileByServerRelativeUrl(folderServerRelativePath + "/" + filename)
      .select("Exists", "ServerRelativeUrl")
      .get();
    if (file.Exists) {
      return [true, file.ServerRelativeUrl];
    } else {
      return [false];
    }
  } catch (e) {
    return [false];
  }
};

export const ensureFolder = async (
  site: string,
  libraryTitle: string,
  folderName: string
): Promise<string> => {
  const folderExistsResult = await isFolderExists(
    site,
    libraryTitle,
    folderName
  );
  if (folderExistsResult[0]) {
    return folderExistsResult[1];
  } else {
    return createFolder(site, libraryTitle, folderName);
  }
};

export const addFileToFolder = async (
  site: string,
  folderServerRelativePath: string,
  fileName: string,
  content: Buffer
) => {
  const web = Web(site);

  const stream = new Readable();
  stream.push(content);
  stream.push(null);

  const fileAddResult = await web
    .getFolderByServerRelativeUrl(folderServerRelativePath)
    .files.configure({ headers: { "content-length": `${content.length}` } })
    .add(fileName, stream);

  return fileAddResult;
};
