import { Field, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditApplication } from "../contexts/EditApplicationContext";
import PageLayout from "../PageLayout";
import { TextArea, TextInput } from "./Fields";

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { application, saveApplication } = useEditApplication();
  const [saveErrorCode, setSaveErrorCode] = useState(0);
  const [scrollToTop, setScrollToTop] = useState(false);

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
        initialValues={application}
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
          return (
            <form className="text-left" onSubmit={formik.handleSubmit}>
              {errorComponent}
              <TextArea name="address" label="Address (inc. postcode)" />
              <TextInput name="telephone" label="Telephone" type="text" />
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
              <div className="mt-2">
                <label>
                  <Field
                    type="checkbox"
                    name="previousVolunteer"
                    className="mr-2"
                  />
                  Have you volunteered for folkweek before?
                </label>
              </div>
              <TextInput
                name="previousTeam"
                label="If so, for which team?"
                type="text"
              />
              <TextInput
                name="personsPreference"
                label="Any people you would like to work with?"
                type="text"
              />
              <div className="mt-2">
                <label>
                  <Field
                    type="checkbox"
                    name="firstAidCertificate"
                    className="mr-2"
                  />
                  Do you have a first aid certificate?
                </label>
              </div>
              <TextInput
                name="occupationOrSkills"
                label="Occupation / transferrable skills"
                type="text"
              />
              <TextInput
                name="dbsDisclosureNumber"
                label="DBS disclosure number"
                description="Only needed if applyiny to join the Children's Team"
                type="text"
              />
              <TextInput
                name="dbsDisclosureDate"
                label="DBS disclosure date"
                description="Only needed if applyiny to join the Children's Team"
                type="text"
              />
              <div className="mt-2">
                <label>
                  <Field type="checkbox" name="camping" className="mr-2" />
                  Do you want to register for camping?
                </label>
              </div>

              <div className="mt-2">
                <label>
                  T shirt size
                  <Field name="tShirtSize" as="select">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </Field>
                </label>
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="block m-auto my-4 p-4 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none"
              >
                Save Workforce Application
              </button>
            </form>
          );
        }}
      </Formik>
    </PageLayout>
  );
};
export default ApplicationForm;
