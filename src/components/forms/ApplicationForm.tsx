import { Field, Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApplicationUpdate,
  useEditApplication,
} from "../contexts/EditApplicationContext";
import { useTeams } from "../contexts/TeamsContext";
import PageLayout from "../PageLayout";
import { DateInput, TextInput } from "./Fields";
import { TeamPreferenceField } from "./TeamPreferenceField";

const ApplicationForm: React.FC = () => {
  const { getRequirementsForTeams } = useTeams();
  const navigate = useNavigate();
  const { application, saveApplication } = useEditApplication();
  const [saveErrorCode, setSaveErrorCode] = useState(0);
  const [scrollToTop, setScrollToTop] = useState(false);

  const initialValues: ApplicationUpdate = useMemo(() => {
    if (application) {
      return {
        emergencyContactName: application.emergencyContactName ?? "",
        emergencyContactTelephone: application.emergencyContactTelephone ?? "",
        previousVolunteer: application.previousVolunteer ?? false,
        previousTeam: application.previousTeam ?? "",
        firstAidCertificate: application.firstAidCertificate ?? false,
        occupationOrSkills: application.occupationOrSkills ?? "",
        dbsDisclosureNumber: application.dbsDisclosureNumber,
        dbsDisclosureDate: application.dbsDisclosureDate,
        camping: application.camping ?? false,
        tShirtSize: application.tShirtSize ?? "S",
        ageGroup: application.ageGroup ?? "18-20",
        otherInformation: application.otherInformation ?? "",
        teamPreference1: application.teamPreference1 ?? "",
        teamPreference2: application.teamPreference2 ?? "",
        teamPreference3: application.teamPreference3 ?? "",
        personsPreference: application.personsPreference ?? "",
        availableFirstFriday: application.availableFirstFriday,
        availableSaturday: application.availableSaturday,
        availableSunday: application.availableSunday,
        availableMonday: application.availableMonday,
        availableTuesday: application.availableTuesday,
        availableWednesday: application.availableWednesday,
        availableThursday: application.availableThursday,
        availableLastFriday: application.availableLastFriday,
      } as ApplicationUpdate;
    } else {
      return {
        emergencyContactName: "",
        emergencyContactTelephone: "",
        previousVolunteer: false,
        previousTeam: "",
        firstAidCertificate: false,
        occupationOrSkills: "",
        dbsDisclosureNumber: "",
        dbsDisclosureDate: "",
        camping: false,
        tShirtSize: undefined,
        ageGroup: undefined,
        otherInformation: "",
        teamPreference1: "",
        teamPreference2: "",
        teamPreference3: "",
        personsPreference: "",
        availableFirstFriday: true,
        availableSaturday: true,
        availableSunday: true,
        availableMonday: true,
        availableTuesday: true,
        availableWednesday: true,
        availableThursday: true,
        availableLastFriday: true,
      } as ApplicationUpdate;
    }
  }, [application]);

  useEffect(() => {
    if (scrollToTop) {
      window.scrollTo(0, 0);
      setScrollToTop(false);
    }
  }, [scrollToTop]);

  if (!application) {
    return (
      <PageLayout>
        <div>Loading...</div>
      </PageLayout>
    );
  }

  let errorComponent: any;
  if (saveErrorCode !== 200) {
    switch (saveErrorCode) {
      case 409:
        errorComponent = (
          <div className="p-4 bg-red-100 rounded-lg overflow-hidden">
            <p>
              Your workforce application form appears to have been updated on a
              different device. The form below has been changed to match those
              updates.
            </p>
            <p>Please ammend the form if needed and save.</p>
            <p>
              If no further changes are needed, please click the Home link
              above.
            </p>
          </div>
        );
        break;

      default:
        <div className="p-4 bg-red-100 rounded-lg overflow-hidden">
          <p>
            There was a problem saving your workforce application. Please try
            again later.
          </p>
        </div>;
        break;
    }
  }

  return (
    <PageLayout>
      <h1 className="text-2xl font-black">Workforce Application Form</h1>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={async (values, { setSubmitting }) => {
          const saveStatus = await saveApplication(values);
          setSubmitting(false);
          setSaveErrorCode(saveStatus);
          setScrollToTop(true);
          if (saveStatus === 200) {
            navigate("/");
          }
        }}
      >
        {(formik) => {
          const teamPreferenceRequirements = getRequirementsForTeams(
            formik.values.teamPreference1,
            formik.values.teamPreference2,
            formik.values.teamPreference3
          );

          const dbsRequired =
            teamPreferenceRequirements.findIndex((req) => req === "DBS") !== -1;

          return (
            <>
              {errorComponent}
              <form className="text-left" onSubmit={formik.handleSubmit}>
                <div className="my-8">
                  <p className="my-2">
                    What is your availability throughout folkweek?
                  </p>
                  <p className="my-2">
                    Please mark checkboxes for the days that you are available.
                    Clear checkboxes for days you are not available.
                  </p>
                  <div className="flex flex-row justify-end gap-4 items-center">
                    <span>Friday 5th August</span>
                    <Field
                      type="checkbox"
                      name="availableFirstFriday"
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-row justify-end gap-4 items-center">
                    <span>Saturday 6th August</span>
                    <Field
                      type="checkbox"
                      name="availableSaturday"
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-row justify-end gap-4 items-center">
                    <span>Sunday 7th August</span>
                    <Field
                      type="checkbox"
                      name="availableSunday"
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-row justify-end gap-4 items-center">
                    <span>Monday 8th August</span>
                    <Field
                      type="checkbox"
                      name="availableMonday"
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-row justify-end gap-4 items-center">
                    <span>Tuesday 9th August</span>
                    <Field
                      type="checkbox"
                      name="availableTuesday"
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-row justify-end gap-4 items-center">
                    <span>Wednesday 10th August</span>
                    <Field
                      type="checkbox"
                      name="availableWednesday"
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-row justify-end gap-4 items-center">
                    <span>Thursday 11th August</span>
                    <Field
                      type="checkbox"
                      name="availableThursday"
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-row justify-end gap-4 items-center">
                    <span>Friday 12th August</span>
                    <Field
                      type="checkbox"
                      name="availableLastFriday"
                      className="mr-2"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <TextInput
                    name="emergencyContactName"
                    label="Emergency contact name"
                    type="text"
                  />
                  <TextInput
                    name="emergencyContactTelephone"
                    label="Emergency contact telephone"
                    type="text"
                  />
                </div>

                <div className="flex flex-row justify-between items-center my-8">
                  <span>Age group</span>
                  <Field name="ageGroup" as="select">
                    {formik.values.ageGroup ? null : (
                      <option value="">Select group</option>
                    )}
                    <option>18-20</option>
                    <option>21-25</option>
                    <option>26-35</option>
                    <option>36-55</option>
                    <option>56-65</option>
                    <option>66+</option>
                  </Field>
                </div>

                <div className="my-8">
                  <div className="flex flex-row justify-between items-center">
                    <span> Have you volunteered for folkweek before?</span>
                    <Field
                      type="checkbox"
                      name="previousVolunteer"
                      className="mr-2"
                    />
                  </div>
                  {formik.values.previousVolunteer ? (
                    <div className="ml-4">
                      <TextInput
                        name="previousTeam"
                        label="Which team?"
                        type="text"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="my-8">
                  <span>
                    Please select the teams you would prefer to work on. Most
                    preferred team first.
                  </span>
                  <TeamPreferenceField
                    name="teamPreference1"
                    label="First team preference"
                    placeholder="Select a team"
                  />
                  <TeamPreferenceField
                    name="teamPreference2"
                    label="Second team preference"
                    placeholder="Select a team"
                  />
                  <TeamPreferenceField
                    name="teamPreference3"
                    label="Third team preference"
                    placeholder="Select a team"
                  />
                </div>

                <div className="my-8">
                  <TextInput
                    name="personsPreference"
                    label="Are there any people you would like to work with? If so, please provide their names."
                    type="text"
                  />
                </div>

                <div className="flex flex-row justify-between items-center my-8">
                  <span>Do you have a current first aid certificate?</span>
                  <Field
                    type="checkbox"
                    name="firstAidCertificate"
                    className="mr-2"
                  />
                </div>

                <div className="my-8">
                  <TextInput
                    name="occupationOrSkills"
                    label="Occupation / transferrable skills"
                    type="text"
                  />
                </div>

                {dbsRequired ? (
                  <div className="my-8">
                    <span>
                      DBS disclosure information is required when applying to
                      join the Children's Team
                    </span>
                    <TextInput
                      name="dbsDisclosureNumber"
                      label="DBS disclosure number"
                      type="text"
                    />
                    <DateInput
                      name="dbsDisclosureDate"
                      label="DBS disclosure date"
                    />
                  </div>
                ) : null}

                <div className="flex flex-row justify-between items-center my-8">
                  <span>Do you want to register for free camping?</span>
                  <Field type="checkbox" name="camping" className="mr-2" />
                </div>

                <div className="flex flex-row justify-between items-center my-8">
                  <span>T shirt size</span>
                  <Field name="tShirtSize" as="select">
                    {formik.values.tShirtSize ? null : (
                      <option value="">Select size</option>
                    )}
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="block m-auto my-4 p-4 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none"
                >
                  Save Workforce Application
                </button>
              </form>
            </>
          );
        }}
      </Formik>
    </PageLayout>
  );
};
export default ApplicationForm;
