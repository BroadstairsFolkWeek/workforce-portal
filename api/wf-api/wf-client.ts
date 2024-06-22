import { Effect, Context } from "effect";

export class WfApiClient extends Context.Tag("WfApiClient")<
  WfApiClient,
  {
    readonly getJson: (path: string, search?: string) => Effect.Effect<unknown>;
  }
>() {}
