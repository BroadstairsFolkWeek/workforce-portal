import { ColumnDefinition } from "@microsoft/microsoft-graph-types";

export type PopulateListDef = {
  displayName: string;
  description: string;
  columns: () => Promise<ColumnDefinition[]>;
};

const loginsList: PopulateListDef = {
  displayName: "Portal User Logins",
  description: "List of logins used for the Workforce Portal.",
  columns: () =>
    Promise.resolve([
      {
        name: "Title",
        indexed: true,
        required: true,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "Email",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "GivenName",
        displayName: "Given Name",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "Surname",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "IdentityProviderUserId",
        displayName: "Identity Provider User Id",
        indexed: true,
        required: true,
        enforceUniqueValues: true,
        text: {},
      },
      {
        name: "IdentityProviderUserDetails",
        displayName: "Identity Provider User Details",
        indexed: true,
        required: true,
        enforceUniqueValues: true,
        text: {},
      },
      {
        name: "IdentityProvider",
        displayName: "Identity Provider",
        indexed: true,
        required: true,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "PhotoRequired",
        displayName: "Photo Required",
        indexed: true,
        required: true,
        enforceUniqueValues: false,
        boolean: {},
      },
      {
        name: "Telephone",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "Address",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {
          allowMultipleLines: true,
          linesForEditing: 5,
        },
      },
      { name: "Version", index: false, required: true, number: {} },
    ]),
};

const teamsList: PopulateListDef = {
  displayName: "Teams",
  description: "List of teams and their duties / skills",
  columns: () =>
    Promise.resolve([
      {
        name: "Title",
        indexed: true,
        required: true,
        enforceUniqueValues: true,
        text: {},
      },
      {
        name: "Description",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {
          allowMultipleLines: true,
          linesForEditing: 5,
        },
      },
    ]),
};

const applicationsList: PopulateListDef = {
  displayName: "Workforce Applications",
  description: "List of applications to join workforce for BFW 2022.",
  columns: () =>
    Promise.resolve([
      {
        name: "Telephone",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "Address",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {
          allowMultipleLines: true,
          linesForEditing: 5,
        },
      },
      {
        name: "EmergencyContactName",
        displayName: "Emergency Contact Name",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "EmergencyContactTelephone",
        displayName: "Emergency Contact Telephone",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "PreviousVolunteer",
        displayName: "Previous Volunteer",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        boolean: {},
        default: { value: "0" },
      },
      {
        name: "PreviousTeam",
        displayName: "Previous Team",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "FirstAidCertificate",
        displayName: "First Aid Certificate",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        boolean: {},
        default: { value: "0" },
      },
      {
        name: "OccupationOrSkills",
        displayName: "Occupation Or Skills",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {
          allowMultipleLines: true,
          linesForEditing: 5,
        },
      },
      {
        name: "DbsDisclosureNumber",
        displayName: "DBS Disclosure Number",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "DbsDisclosureDate",
        displayName: "DBS Disclosure Date",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        dateTime: {
          displayAs: "standard",
          format: "dateOnly",
        },
      },
      {
        name: "Camping",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        boolean: {},
        default: { value: "No" },
      },
      {
        name: "TShirtSize",
        displayName: "T Shirt Size",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        choice: {
          allowTextEntry: false,
          choices: ["S", "M", "L", "XL", "XXL"],
          displayAs: "dropDownMenu",
        },
      },
      {
        name: "AgeGroup",
        displayName: "Age Group",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        choice: {
          allowTextEntry: false,
          choices: ["18-20", "21-25", "26-35", "36-55", "56-65", "66+"],
          displayAs: "dropDownMenu",
        },
      },
      {
        name: "OtherInformation",
        displayName: "Other Information",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {
          allowMultipleLines: true,
          linesForEditing: 5,
        },
      },
      {
        name: "PhotoFileName",
        displayName: "Photo File Name",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "IdentityProviderUserId",
        displayName: "Identity Provider User Id",
        indexed: true,
        required: true,
        enforceUniqueValues: true,
        text: {},
      },
      {
        name: "TeamPreference1",
        displayName: "Team Preference 1",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "TeamPreference2",
        displayName: "Team Preference 2",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "TeamPreference3",
        displayName: "Team Preference 3",
        indexed: true,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      {
        name: "PersonsPreference",
        displayName: "Persons Preference",
        indexed: false,
        required: false,
        enforceUniqueValues: false,
        text: {},
      },
      { name: "Version", index: false, required: true, number: {} },
      {
        name: "Status",
        index: true,
        required: true,
        choice: {
          allowTextEntry: false,
          choices: [
            "info-required",
            "photo-required",
            "documents-required",
            "ready-to-submit",
            "complete",
          ],
          displayAs: "dropDownMenu",
        },
      },
    ]),
};

const allLists: PopulateListDef[] = [loginsList, teamsList, applicationsList];

export default allLists;
