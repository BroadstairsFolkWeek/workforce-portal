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
            <>
              {errorComponent}
              <form className="text-left" onSubmit={formik.handleSubmit}>
                <div className="mb-8">
                  <TextArea name="address" label="Address (inc. postcode)" />
                  <TextInput name="telephone" label="Telephone" type="text" />
                </div>

                <div className="my-8">
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
                  <TextInput
                    name="personsPreference"
                    label="Are there any people you would like to work with? If so, please provide their names."
                    type="text"
                  />
                </div>

                <div className="flex flex-row justify-between items-center my-8">
                  <span>Do you have a first aid certificate?</span>
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

                <div className="my-8">
                  <TextInput
                    name="dbsDisclosureNumber"
                    label="DBS disclosure number"
                    description="Only needed if applying to join the Children's Team"
                    type="text"
                  />
                  <TextInput
                    name="dbsDisclosureDate"
                    label="DBS disclosure date"
                    description="Only needed if applying to join the Children's Team"
                    type="text"
                  />
                </div>

                <div className="flex flex-row justify-between items-center my-8">
                  <span>Do you want to register for camping?</span>
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
