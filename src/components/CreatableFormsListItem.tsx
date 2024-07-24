import { PropsWithChildren, useCallback } from "react";
import { FormSpec } from "../interfaces/form";
import { useFormSubmissionHandlers } from "../routes/FormSubmissionHandlers";
import CreatableFormControls from "./CreatableFormControls";

interface CreatableFormsListItemProps {
  creatableForm: FormSpec;
}

const ListItemHeader = ({
  creatableForm,
  children,
}: PropsWithChildren<{
  creatableForm: FormSpec;
}>) => {
  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-row justify-between p-2 bg-bfw-yellow ">
        <div>{creatableForm.fullName}</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const ListItemFooter = ({
  children,
}: PropsWithChildren<{
  creatableForm: FormSpec;
}>) => {
  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-col justify-between p-2 bg-black text-xs text-white">
        <div>TODO</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const CreatableFormsListItem: React.FC<CreatableFormsListItemProps> = ({
  creatableForm,
}) => {
  const { displayNewForm: newForm } = useFormSubmissionHandlers();

  const newFormHandler = useCallback(() => {
    newForm(creatableForm);
  }, [newForm, creatableForm]);

  return (
    <div className="flex flex-col bg-yellow-100 rounded-lg overflow-hidden">
      <ListItemHeader creatableForm={creatableForm} />

      <div className="flex flex-row">
        <div className="p-4 flex-grow overflow-hidden">
          <div className="text-sm">{creatableForm.description}</div>
        </div>
        <div className="py-4 pr-2 w-40">
          <CreatableFormControls newForm={newFormHandler} />
        </div>
      </div>
      <ListItemFooter creatableForm={creatableForm} />
    </div>
  );
};

export default CreatableFormsListItem;
