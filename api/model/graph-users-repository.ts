import { Effect, Context } from "effect";
import { ModelGraphUser } from "./interfaces/graph-user";

export class GraphUserNotFound {
  readonly _tag = "GraphUserNotFound";
}

export class GraphUsersRepository extends Context.Tag("GraphUsersRepository")<
  GraphUsersRepository,
  {
    readonly modelGetGraphUserById: (
      id: string
    ) => Effect.Effect<ModelGraphUser, GraphUserNotFound>;
  }
>() {}
