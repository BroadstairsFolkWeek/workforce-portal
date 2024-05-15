import { Schema as S } from "@effect/schema";

const ModelTeamRequirements = S.Literal("DBS", "Drivers License");

const ModelCoreTeam = S.Struct({
  team: S.propertySignature(S.String).pipe(S.fromKey("Title")),
  description: S.optional(S.String).pipe(S.fromKey("Description")),
  displayOrder: S.propertySignature(S.Int).pipe(S.fromKey("DisplayOrder")),
  requirements: S.optional(ModelTeamRequirements).pipe(
    S.fromKey("Requirements")
  ),
});

const ModelTeamPersistanceData = S.Struct({
  dbId: S.propertySignature(S.NumberFromString).pipe(S.fromKey("id")),
  createdDate: S.propertySignature(S.DateFromString).pipe(S.fromKey("Created")),
  modifiedDate: S.propertySignature(S.DateFromString).pipe(
    S.fromKey("Modified")
  ),
});

export const ModelPersistedTeam = S.extend(
  ModelCoreTeam,
  ModelTeamPersistanceData
);

export interface ModelPersistedTeam
  extends S.Schema.Type<typeof ModelPersistedTeam> {}
