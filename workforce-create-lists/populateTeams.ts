import fsPromises from "fs/promises";
import { parse as csvParse } from "csv-parse/sync";
import { config as dotenvconfig } from "dotenv";
import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import { ListItem } from "@microsoft/microsoft-graph-types";

import validateEnv from "./utils/validateEnv";
import { CsvTeam, PersistedTeam, Team } from "./interfaces/team";

dotenvconfig();
validateEnv();

const credential = new ClientSecretCredential(
  process.env["TENANT_ID"],
  process.env["CLIENT_ID"],
  process.env["CLIENT_SECRET"]
);
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ["https://graph.microsoft.com/.default"],
});

const client = Client.initWithMiddleware({
  debugLogging: true,
  authProvider,
});

async function loadTeamsFromCsv(): Promise<CsvTeam[]> {
  const tradesFileContent = await fsPromises.readFile("teams.csv");
  const rows: CsvTeam[] = csvParse(tradesFileContent, {
    columns: true,
    skipEmptyLines: true,
    trim: true,
  });

  console.log("Loaded from csv", rows);
  return rows;
}

async function getSiteBaseApi(): Promise<string> {
  const siteRequest = await client
    .api(
      `/sites/${process.env["TENANT_NAME"]}.sharepoint.com:${process.env["SITE_PATH"]}`
    )
    .get();
  const siteBaseApi: string = "sites/" + siteRequest.id;
  return siteBaseApi;
}

async function getTeamsListBaseApi(): Promise<string> {
  const siteBaseApi = await getSiteBaseApi();
  const existingList = await client
    .api(siteBaseApi + "/lists/Teams?expand=columns(select=id,name)")
    .get();

  const listBaseApi: string = siteBaseApi + "/lists/" + existingList.id;
  return listBaseApi;
}

function listItemToPersistedTeams(item: ListItem): PersistedTeam {
  const columnValues = item.fields as any;
  return {
    ID: Number(item.id),
    Title: columnValues.Title,
    Description: columnValues.Summary,
  };
}

async function loadPersistedTeams(): Promise<PersistedTeam[]> {
  const listBaseApi = await getTeamsListBaseApi();

  const existingListItems = await client
    .api(listBaseApi + "/items?expand=fields")
    .get();

  const persistedTrades = existingListItems.value.map(listItemToPersistedTeams);
  return persistedTrades;
}

function isDifferent(
  sourceTeam: CsvTeam,
  persistedTeam: PersistedTeam
): boolean {
  return sourceTeam.Summary !== persistedTeam.Description;
}

async function populateTeams() {
  const sourceTeams = await loadTeamsFromCsv();
  const persistedTeams = await loadPersistedTeams();

  // Build a map of persisted teams by title so we can quickly find persisted teams when iterated the source teams.
  const persistedTeamsMap = new Map<string, PersistedTeam>();
  persistedTeams.forEach((pt) => persistedTeamsMap.set(pt.Title, pt));

  // Build a set of the source team titles as a way to check for duplicates.
  const sourceTeamsSet = new Set<string>(sourceTeams.map((t) => t.TEAM));
  if (sourceTeamsSet.size !== sourceTeams.length) {
    throw new Error(
      `Duplicate team name in source teams (${sourceTeams.length}, ${sourceTeamsSet.size})`
    );
  }

  const newTeams: Team[] = [];
  const modifiedTeams: PersistedTeam[] = [];

  sourceTeams.forEach((sourceTeam) => {
    const existing = persistedTeamsMap.get(sourceTeam.TEAM);
    if (existing) {
      if (isDifferent(sourceTeam, existing)) {
        modifiedTeams.push({
          ID: existing.ID,
          Title: sourceTeam.TEAM,
          Description: sourceTeam.Summary,
        });
      }
    } else {
      newTeams.push({
        Title: sourceTeam.TEAM,
        Description: sourceTeam.Summary,
      });
    }
  });

  const listBaseApi = await getTeamsListBaseApi();

  // Create any new teams.
  newTeams.forEach(async (newTeam) => {
    await client.api(listBaseApi + "/items").post({
      fields: newTeam,
    });
  });

  // Update any modified teams.
  modifiedTeams.forEach(async (modifiedTeam) => {
    const id = modifiedTeam.ID;
    const modifiedTeamWithoutId = { ...modifiedTeam };
    delete modifiedTeamWithoutId.ID;
    await client
      .api(listBaseApi + `/items/${id}/fields`)
      .update(modifiedTeamWithoutId);
  });
}

populateTeams();
