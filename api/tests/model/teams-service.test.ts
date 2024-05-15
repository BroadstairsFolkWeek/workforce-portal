import { Effect, Layer, Array } from "effect";
import { TeamsRepository } from "../../model/teams-repository";
import { getTeamsSortedByDisplayOrder } from "../../services/teams-service";

const mockLayers = Layer.succeed(TeamsRepository, {
  modelGetTeams: () =>
    Effect.succeed([
      {
        team: "Bar",
        dbId: 30,
        description:
          "Must have previous experience, be a friendly people person. The role is physical and requires a lot of standing.",
        displayOrder: 30,
        createdDate: new Date("2022-01-29T08:53:12.000Z"),
        modifiedDate: new Date("2022-02-12T14:17:13.000Z"),
      },
      {
        team: "Campsite",
        dbId: 31,
        description:
          "Some physical work, dealing with practical issues as they arise, gate duty, campsite patrols etc.  We need people who will enjoy keeping the campsite a safe and pleasant environment for our visitors.  Some late nights",
        displayOrder: 50,
        createdDate: new Date("2022-01-29T08:53:12.000Z"),
        modifiedDate: new Date("2022-02-12T14:17:20.000Z"),
      },
      {
        team: "Craft Fair Venue",
        dbId: 32,
        description:
          "Venue stewarding, monitoring gates, keeping the venue clear of litter. Helping the public and traders with any issues. ",
        displayOrder: 20,
        createdDate: new Date("2022-01-29T08:53:12.000Z"),
        modifiedDate: new Date("2022-02-12T14:17:42.000Z"),
      },
    ]),
});

test("getTeamsSortedByDisplayOrder sorts Teams", () => {
  const expectedDisplayOrders = [20, 30, 50];

  const program = getTeamsSortedByDisplayOrder().pipe(
    Effect.provide(mockLayers),
    Effect.andThen(Array.map((team) => team.displayOrder))
  );

  const runnable = Effect.provide(program, mockLayers);

  const actual = Effect.runSync(runnable);

  expect(actual).toStrictEqual(expectedDisplayOrders);
});
