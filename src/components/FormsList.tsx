import { useSelector } from "react-redux";
import { Form } from "../interfaces/form";
import FormsListItem from "./FormsListItem";
import SpinnerOverlay from "./SpinnerOverlay";
import { selectFormsSavingStatus } from "../features/forms/forms-slice";
import { useMemo } from "react";
import { Profile } from "../interfaces/profile";

interface FormsListProps {
  forms: readonly Form[];
  profile: Profile;
}

const FormsList: React.FC<FormsListProps> = ({ forms, profile }) => {
  const formsSavingStatus = useSelector(selectFormsSavingStatus);

  const spinnerOverlay = useMemo(
    () => (formsSavingStatus === "saving" ? <SpinnerOverlay /> : null),
    [formsSavingStatus]
  );

  return (
    <div className="relative">
      <div>
        {forms.map((form) => (
          <FormsListItem key={form.id} form={form} profile={profile} />
        ))}
      </div>

      {spinnerOverlay}
    </div>
  );
};

export default FormsList;
