import { v4 as uuidv4 } from "uuid";
import {
  AddableApplication,
  Application,
  ApplicationDto,
} from "../interfaces/application";
import { Profile } from "../interfaces/profile";
import { logError, logTrace, logWarn } from "../utilties/logging";
import {
  createApplicationListItem,
  deleteApplicationListItem,
  updateApplicationListItem,
} from "./application-sp";
import {
  getOrCreateProfileForAuthenticatedUser,
  getProfileForAuthenticatedUserEffect,
} from "./profile-service";
import { Effect, Layer } from "effect";
import { defaultGraphClient } from "../graph/default-graph-client";
import { ApplicationsRepository } from "../model/applications-repository";
import { applicationsRepositoryLive } from "../model/applications-repository-graph";
import { graphListAccessesLive } from "../contexts/graph-list-access-live";
import {
  ModelPersistedProfile,
  ModelProfile,
} from "../model/interfaces/profile";
import {
  ModelApplicationChanges,
  ModelPersistedApplication,
} from "../model/interfaces/application";
import { repositoriesLayerLive } from "../contexts/repositories-live";

const APPLICATION_SERVICE_ERROR_TYPE_VAL =
  "application-service-error-760bf8f3-6c06-4d4d-86ce-050884c8f50a";

type ApplicationServiceErrorType =
  | "version-conflict"
  | "application-not-found"
  | "application-in-wrong-state";
export class ApplicationServiceError {
  private type: typeof APPLICATION_SERVICE_ERROR_TYPE_VAL =
    APPLICATION_SERVICE_ERROR_TYPE_VAL;
  public error: ApplicationServiceErrorType;
  public arg1: string | Application | null;

  constructor(error: ApplicationServiceErrorType, arg1?: string | Application) {
    this.error = error;
    this.arg1 = arg1 ?? null;
  }
}

export class ApplicationVersionMismatch {
  readonly _tag = "ApplicationVersionMismatch";
}

export class ApplicationNotFound {
  readonly _tag = "ApplicationNotFound";
}

export function isApplicationServiceError(
  obj: any
): obj is ApplicationServiceError {
  return obj?.type === APPLICATION_SERVICE_ERROR_TYPE_VAL;
}

export const getApplicationByProfile = (
  profile: Profile | ModelPersistedProfile | ModelProfile
) =>
  ApplicationsRepository.pipe(
    Effect.andThen((service) =>
      service.modelGetApplicationByProfileId(profile.profileId)
    )
  );

export const getApplicationByProfileAndUpdateIfNeeded = (
  profile: ModelProfile
) => {
  return getApplicationByProfile(profile).pipe(
    Effect.andThen(updateApplicationFromProfileIfNeededEffect(profile))
  );
};

function propertyValueIsString(v: any): v is string {
  return typeof v === "string";
}

const isPropertyValueMissing = <T>(
  addableApplication: T,
  field: keyof T
): boolean => {
  return isValueMissing(addableApplication[field]);
};

const isValueMissing = (value: any) => {
  return (
    value === undefined ||
    value === null ||
    (propertyValueIsString(value) && value.trim().length === 0)
  );
};

const determineApplicationStatus = (
  addableApplication: AddableApplication | ModelApplicationChanges,
  userProfile: Profile | ModelProfile
): AddableApplication["status"] => {
  logTrace(
    "determineApplicationStatus: addableApplication: " +
      JSON.stringify(addableApplication, null, 2)
  );

  const mandatoryFields: Array<keyof ModelApplicationChanges> = [
    "emergencyContactName",
    "emergencyContactTelephone",
    "ageGroup",
    "tShirtSize",
  ];
  if (
    mandatoryFields.some((field) =>
      isPropertyValueMissing(addableApplication, field)
    )
  ) {
    return "info-required";
  }

  if (
    [
      addableApplication.teamPreference1,
      addableApplication.teamPreference2,
      addableApplication.teamPreference3,
    ].includes("Children's Events")
  ) {
    const mandatoryChildrensTeamFields: Array<keyof ModelApplicationChanges> = [
      "dbsDisclosureNumber",
      "dbsDisclosureDate",
    ];
    if (
      mandatoryChildrensTeamFields.some((field) =>
        isPropertyValueMissing(addableApplication, field)
      )
    ) {
      return "info-required";
    }
  }

  const mandatoryProfileFields: Array<keyof Profile> = [
    "displayName",
    "telephone",
    "address",
  ];
  if (
    mandatoryProfileFields.some((field) =>
      isPropertyValueMissing(userProfile, field)
    )
  ) {
    return "profile-required";
  }

  if (!userProfile.photoUrl) {
    return "photo-required";
  }

  if (!addableApplication.acceptedTermsAndConditions) {
    return "info-required";
  }

  if (
    addableApplication.status === "submitted" ||
    addableApplication.status === "complete"
  ) {
    return addableApplication.status;
  } else {
    return "ready-to-submit";
  }
};

export const saveApplication = async (
  applicationDto: ApplicationDto,
  userId: string
): Promise<Application> => {
  const userProfileWithCurrentApplication =
    await getOrCreateProfileForAuthenticatedUser(userId);

  const userProfile = userProfileWithCurrentApplication.profile;
  const existingApplication = userProfileWithCurrentApplication.application;

  if (existingApplication) {
    logTrace("saveApplication: Application already exists. Updating");
    // If an application exists then we can update it as long as the version numbers match.
    if (existingApplication.version === applicationDto.version) {
      // Check te existing application is in an editable state.
      if (
        existingApplication.status === "submitted" ||
        existingApplication.status === "complete"
      ) {
        throw new ApplicationServiceError("application-in-wrong-state");
      }

      const updatedApplication: Application = {
        ...existingApplication,
        ...applicationDto,
        title: userProfile.displayName,
        address: userProfile.address,
        telephone: userProfile.telephone,
        version: existingApplication.version + 1,
      };
      updatedApplication.status = determineApplicationStatus(
        updatedApplication,
        userProfile
      );
      logTrace(
        "saveApplication: Determined application status: " +
          updatedApplication.status
      );

      return updateApplicationListItem(updatedApplication);
    } else {
      // The application being saved has a different version number to the existing application. The user may
      // have saved the application from another device.
      throw new ApplicationServiceError(
        "version-conflict",
        `Existing version: ${existingApplication.version}. Saving version: ${applicationDto.version}.`
      );
    }
  } else {
    const applicationId = uuidv4();

    logTrace(
      "saveApplication: Application does not exist. Creating new application. Application ID: " +
        applicationId
    );
    const addableApplicationWithProfileValuesAndVersion: AddableApplication = {
      ...applicationDto,
      applicationId,
      profileId: userProfile.profileId,
      title: userProfile.displayName,
      address: userProfile.address,
      telephone: userProfile.telephone,
      status: "info-required",
      version: 1,
    };
    addableApplicationWithProfileValuesAndVersion.status =
      determineApplicationStatus(
        addableApplicationWithProfileValuesAndVersion,
        userProfile
      );
    logTrace(
      "saveApplication: Determined application status: " +
        addableApplicationWithProfileValuesAndVersion.status
    );
    return createApplicationListItem(
      addableApplicationWithProfileValuesAndVersion
    );
  }
};

export const updateApplicationFromProfileIfNeeded = async (
  existingApplication: Application,
  profile: Profile
): Promise<Application> => {
  const updatedApplication: Application = {
    ...existingApplication,
    title: profile.displayName,
    address: profile.address ?? undefined,
    telephone: profile.telephone ?? undefined,
    version: existingApplication.version + 1,
  };

  updatedApplication.status = determineApplicationStatus(
    updatedApplication,
    profile
  );

  logTrace(
    "updateApplicationFromProfile: Determined application status: " +
      updatedApplication.status
  );

  // Only update the application if there are any changes.
  if (
    existingApplication.title !== updatedApplication.title ||
    existingApplication.address !== updatedApplication.address ||
    existingApplication.telephone !== updatedApplication.telephone ||
    existingApplication.status !== updatedApplication.status
  ) {
    const saveApplicationEffect = ApplicationsRepository.pipe(
      Effect.andThen((repository) =>
        repository.modelSaveApplicationChanges(
          existingApplication.applicationId
        )(existingApplication.version)(updatedApplication)
      ),
      Effect.catchTags({
        // If the application cannot be found or there is a repository conflict then
        // we'll just return the existing application. The underlying issue will be reported
        // to the user next time they retrieve or update the application.
        ApplicationNotFound: () => Effect.succeed(existingApplication),
        RepositoryConflictError: () => Effect.succeed(existingApplication),
      })
    );

    const layers = applicationsRepositoryLive.pipe(
      Layer.provide(graphListAccessesLive),
      Layer.provide(defaultGraphClient)
    );
    const runnable = Effect.provide(saveApplicationEffect, layers);

    const savedApplication = await Effect.runPromise(runnable);
    return savedApplication;
  } else {
    return existingApplication;
  }
};

export const updateApplicationFromProfileIfNeededEffect =
  (profile: Profile | ModelProfile) =>
  (existingApplication: ModelPersistedApplication) => {
    const interimUpdatedApplication: ModelApplicationChanges = {
      ...existingApplication,
      title: profile.displayName,
      address: profile.address ?? undefined,
      telephone: profile.telephone ?? undefined,
    };

    const updatedApplication: ModelApplicationChanges = {
      ...interimUpdatedApplication,
      status: determineApplicationStatus(interimUpdatedApplication, profile),
    };

    return Effect.log(
      "updateApplicationFromProfile: Determined application status: " +
        updatedApplication.status
    ).pipe(
      Effect.andThen(
        Effect.if(
          existingApplication.title !== updatedApplication.title ||
            existingApplication.address !== updatedApplication.address ||
            existingApplication.telephone !== updatedApplication.telephone ||
            existingApplication.status !== updatedApplication.status,
          {
            onTrue: () =>
              ApplicationsRepository.pipe(
                Effect.andThen((service) =>
                  service.modelSaveApplicationChanges(
                    existingApplication.applicationId
                  )(existingApplication.version)(updatedApplication)
                ),
                Effect.catchTags({
                  // If the application cannot be found or there is a repository conflict then
                  // we'll just return the existing application. The underlying issue will be reported
                  // to the user next time they retrieve or update the application.
                  ApplicationNotFound: () =>
                    Effect.succeed(existingApplication),
                  RepositoryConflictError: () =>
                    Effect.succeed(existingApplication),
                })
              ),
            onFalse: () => Effect.succeed(existingApplication),
          }
        )
      )
    );
  };

const deleteApplicationIfVersionMatch =
  (applicationVersion: number) => (application: ModelPersistedApplication) => {
    if (applicationVersion === application.version) {
      return ApplicationsRepository.pipe(
        Effect.andThen((service) =>
          service.modelDeleteApplicationByApplicationId(
            application.applicationId
          )
        )
      );
    } else {
      return Effect.logWarning(
        `deleteApplication: Aborting due to application version mismatch. Expected version: ${applicationVersion}. Application's actual version: ${application.version}`
      ).pipe(Effect.andThen(Effect.fail(new ApplicationVersionMismatch())));
    }
  };

export const deleteApplicationEffect = (
  userId: string,
  applicationVersion: number
) =>
  getProfileForAuthenticatedUserEffect(userId).pipe(
    Effect.andThen(({ profile, application }) =>
      application.pipe(
        Effect.andThen((application) =>
          deleteApplicationIfVersionMatch(applicationVersion)(application)
        ),
        Effect.catchTag("NoSuchElementException", () =>
          Effect.logWarning(
            `deleteApplication: No application found for ProfileId ${profile.profileId}`
          ).pipe(Effect.andThen(Effect.fail(new ApplicationNotFound())))
        )
      )
    )
  );

export const deleteApplication = async (
  userId: string,
  applicationVersion: number
): Promise<void> => {
  // Retrieve any application the user may have already saved.
  const profileAndApplication = await getOrCreateProfileForAuthenticatedUser(
    userId
  );
  const existingApplication = profileAndApplication?.application;
  if (existingApplication) {
    logTrace(
      "deleteApplication: Retrieved existing application with version: " +
        existingApplication.version
    );

    if (applicationVersion !== existingApplication.version) {
      logWarn("deleteApplication: Aborting due to mismatched version numbers");
      throw new ApplicationServiceError("version-conflict");
    }

    await deleteApplicationListItem(existingApplication);
  } else {
    logWarn("deleteApplication: Application not found");
    throw new ApplicationServiceError("application-not-found");
  }
};

export const submitApplication = async (
  userId: string
): Promise<Application> => {
  const profileAndApplication = await getOrCreateProfileForAuthenticatedUser(
    userId
  );
  const application = profileAndApplication?.application;

  if (application) {
    logTrace(
      "submitApplication: Found application. Current status: " +
        application.status
    );
    if (application.status === "ready-to-submit") {
      const updatedApplication: Application = {
        ...application,
        status: "submitted",
        version: application.version + 1,
      };

      logTrace(
        "submitApplication: Updating application to submitted status. Version: " +
          updatedApplication.version
      );

      return updateApplicationListItem(updatedApplication);
    } else {
      logError(
        "submitApplication: Application is not ready to submit. Current status: " +
          application.status
      );
      throw new ApplicationServiceError(
        "application-in-wrong-state",
        application
      );
    }
  } else {
    logWarn("submitApplication: Application not found.");
    throw new ApplicationServiceError("application-not-found");
  }
};

export const retractApplication = async (
  userId: string
): Promise<Application> => {
  const profileAndApplication = await getOrCreateProfileForAuthenticatedUser(
    userId
  );
  const application = profileAndApplication?.application;

  if (application) {
    logTrace(
      "retractApplication: Found application. Current status: " +
        application.status
    );
    if (application.status === "submitted") {
      const updatedApplication: Application = {
        ...application,
        status: "ready-to-submit",
        version: application.version + 1,
      };
      logTrace(
        "retractApplication: Updating application to ready-to-submit status. Version: " +
          updatedApplication.version
      );
      return updateApplicationListItem(updatedApplication);
    } else {
      logError(
        "retractApplication: Application is not retractable. Current status: " +
          application.status
      );
      throw new ApplicationServiceError(
        "application-in-wrong-state",
        application
      );
    }
  } else {
    logWarn("retractApplication: Application not found.");
    throw new ApplicationServiceError("application-not-found");
  }
};
