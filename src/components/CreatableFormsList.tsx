import { useMemo } from "react";
import { useSelector } from "react-redux";
import { FormSpec } from "../interfaces/form";
import SpinnerOverlay from "./SpinnerOverlay";
import { selectFormsSavingStatus } from "../features/forms/forms-slice";
import CreatableFormsListItem from "./CreatableFormsListItem";

interface CreatableFormsListProps {
  creatableForms: readonly FormSpec[];
}

const CreatableFormsList: React.FC<CreatableFormsListProps> = ({
  creatableForms,
}) => {
  const formsSavingStatus = useSelector(selectFormsSavingStatus);

  const spinnerOverlay = useMemo(
    () =>
      formsSavingStatus === "saving" ? <SpinnerOverlay size="md" /> : null,
    [formsSavingStatus]
  );

  return (
    <div className="relative">
      <div>
        {creatableForms.map((creatableForm) => (
          <CreatableFormsListItem
            key={creatableForm.id}
            creatableForm={creatableForm}
          />
        ))}
      </div>

      {spinnerOverlay}
    </div>
  );
};

export default CreatableFormsList;
