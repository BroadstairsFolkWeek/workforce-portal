import { Effect, Context } from "effect";
import { ModelPersistedTeam } from "./interfaces/team";

export class TeamsRepository extends Context.Tag("TeamsRepository")<
  TeamsRepository,
  {
    readonly modelGetTeams: () => Effect.Effect<ModelPersistedTeam[]>;
  }
>() {}
