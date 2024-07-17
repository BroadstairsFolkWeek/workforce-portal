import { Effect } from "effect";
import { ProfilesRepository } from "../model/profiles-repository";

export const deleteUser = (userId: string) => {
  return ProfilesRepository.pipe(
    Effect.andThen((repository) =>
      repository.modelDeleteProfileByUserId(userId)
    )
  );
};
