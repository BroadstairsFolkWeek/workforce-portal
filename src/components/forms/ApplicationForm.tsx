import { Field, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { useEditApplication } from "../contexts/EditApplicationContext";
import PageLayout from "../PageLayout";
import { TextArea, TextInput } from "./Fields";

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { application, saveApplication } = useEditApplication();

  if (!application) {
    return (
      <PageLayout>
        <div>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h1 className="text-2xl font-black">Workforce Application Form</h1>
      <Formik
        initialValues={application}
        onSubmit={async (values, { setSubmitting }) => {
          await saveApplication(values);
          setSubmitting(false);
          navigate("/");
        }}
      >
        {(formik) => {
          return (
            <form className="text-left" onSubmit={formik.handleSubmit}>
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
                className="block m-auto my-4 p-4 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text"
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
