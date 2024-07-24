import { ErrorRenderer } from "../../interfaces/error-renderer";

export class SaveProfileConflictError implements ErrorRenderer {
  public render(): JSX.Element {
    return (
      <div className="bg-red-100 rounded-lg overflow-hidden">
        <p className="my-2">
          Your profile has already been updated. Have you already saved a newer
          version of the profile on another device?
        </p>
        <p className="my-2">
          Please check the profile and make any needed changes again.
        </p>
      </div>
    );
  }
}

export const LoadProfileError = () => {
  return (
    <div className="bg-red-100 rounded-lg overflow-hidden">
      <p className="my-2">There was an error loading your profile.</p>
      <p className="my-2">Please referesh the page and try again.</p>
    </div>
  );
};
