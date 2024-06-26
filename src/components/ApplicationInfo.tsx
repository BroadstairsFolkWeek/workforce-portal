import { DateTime } from "luxon";
import { Application } from "../interfaces/application";
import { Team } from "../interfaces/team";

const formFieldDescriptions: Required<{ [x in keyof Application]: string }> = {
  telephone: "Telephone",
  address: "Address",
  ageGroup: "Age group",
  camping: "Camping required",
  emergencyContactName: "Emergency contact name",
  emergencyContactTelephone: "Emergency contact phone",
  dbsDisclosureDate: "DBS disclosure date",
  dbsDisclosureNumber: "DBS disclosure number",
  tShirtSize: "T-shirt size",
  firstAidCertificate: "First aid certificate",
  occupationOrSkills: "Occupation/skills",
  personsPreference: "Persons preference",
  previousVolunteer: "Previous volunteer",
  previousTeam: "Previous team",
  teamPreference1: "Team preference",
  teamPreference2: "Team preference",
  teamPreference3: "Team preference",
  otherInformation: "Other information",
  lastSaved: "Last saved",
  version: "Version",
  status: "Status",
  availableFirstFriday: "Available Friday 5th August",
  availableSaturday: "Available Saturday 6th August",
  availableSunday: "Available Sunday 7th August",
  availableMonday: "Available Monday 8th August",
  availableTuesday: "Available Tuesday 9th August",
  availableWednesday: "Available Wednesday 10th August",
  availableThursday: "Available Thursday 11th August",
  availableLastFriday: "Available Friday 12th August",
  constraints: "Constraints/Support needed",
  whatsApp: "Join WhatsApp group",
  acceptedTermsAndConditions: "Accept the terms and conditions",
};

const isDraftApplication = (application: Application) => {
  return application.version === 0;
};

const addDescriptionComponents = (
  descriptionComponents: JSX.Element[],
  application: Application,
  property: keyof Application
) => {
  if (application[property] !== undefined) {
    descriptionComponents.push(
      <div
        className="block my-1 overflow-hidden whitespace-nowrap"
        key={descriptionComponents.length}
      >
        {formFieldDescriptions[property]}: {application[property]}
      </div>
    );
  }
};

const addMultilineDescriptionComponents = (
  descriptionComponents: JSX.Element[],
  application: Application,
  property: keyof Application
) => {
  if (application[property] !== undefined) {
    descriptionComponents.push(
      <div key={descriptionComponents.length} className="my-2">
        <div className="block overflow-hidden whitespace-nowrap">
          {formFieldDescriptions[property]}:
        </div>
        <div className="block " key={descriptionComponents.length}>
          {application[property]}
        </div>
      </div>
    );
  }
};

const applicationDescriptionComponents = (application: Application) => {
  const retArray: JSX.Element[] = [];

  addMultilineDescriptionComponents(retArray, application, "address");
  addDescriptionComponents(retArray, application, "telephone");
  addDescriptionComponents(retArray, application, "ageGroup");
  addDescriptionComponents(retArray, application, "tShirtSize");
  addMultilineDescriptionComponents(
    retArray,
    application,
    "emergencyContactName"
  );
  addMultilineDescriptionComponents(
    retArray,
    application,
    "emergencyContactTelephone"
  );
  addDescriptionComponents(retArray, application, "teamPreference1");
  addDescriptionComponents(retArray, application, "teamPreference2");
  addDescriptionComponents(retArray, application, "teamPreference3");

  if (application.camping) {
    retArray.push(
      <span className="block my-2" key={retArray.length}>
        Camping required
      </span>
    );
  } else {
    retArray.push(
      <span className="block my-2" key={retArray.length}>
        Camping not required
      </span>
    );
  }

  return retArray;
};

const addTodoComponent = (
  todoDescriptions: string[],
  application: Application,
  property: keyof Application
) => {
  if (application[property] === undefined) {
    todoDescriptions.push(formFieldDescriptions[property]);
  }
};

export const applicationTodoComponents = (
  application: Application,
  requirements: Array<Team["requirements"]>
) => {
  const infoNeededFields: Array<keyof Application> = [
    "emergencyContactName",
    "emergencyContactTelephone",
    "tShirtSize",
    "ageGroup",
  ];

  const dbsRequired = requirements.findIndex((req) => req === "DBS") !== -1;
  if (dbsRequired) {
    infoNeededFields.push("dbsDisclosureNumber");
    infoNeededFields.push("dbsDisclosureDate");
  }

  const infoNeededDescriptions: string[] = [];
  infoNeededFields.forEach((f) =>
    addTodoComponent(infoNeededDescriptions, application, f)
  );

  const retArray = [];

  if (infoNeededDescriptions.length > 0) {
    retArray.push(
      <span className="block" key={retArray.length}>
        Please edit this application and add:{" "}
        {infoNeededDescriptions.join(", ")}
      </span>
    );
  }

  if (!application.acceptedTermsAndConditions) {
    retArray.push(
      <span className="block" key="TsAndCs">
        Please edit this application and accept the workforce terms and
        conditions.
      </span>
    );
  }

  return retArray;
};

const ApplicationInfo = ({ application }: { application: Application }) => {
  const timestampComponent = isDraftApplication(application) ? (
    <span className="text-sm">NOT SAVED</span>
  ) : (
    <span className="text-sm">
      Last saved:{" "}
      {DateTime.fromISO(application.lastSaved).toLocaleString(
        DateTime.DATETIME_MED
      )}
    </span>
  );

  return (
    <>
      <span className="block">{timestampComponent}</span>
      {applicationDescriptionComponents(application)}
    </>
  );
};

export default ApplicationInfo;
