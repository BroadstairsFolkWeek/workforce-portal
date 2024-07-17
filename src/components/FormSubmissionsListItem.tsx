import { PropsWithChildren } from "react";
import { FormSubmission } from "../interfaces/form";

interface FormSubmissionListItemProps {
  formSubmission: FormSubmission;
}

const ListItemHeader = ({
  formSubmission,
  children,
}: PropsWithChildren<{
  formSubmission: FormSubmission;
}>) => {
  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-row justify-between p-2 bg-bfw-yellow text-xs whitespace-nowrap">
        <div>{formSubmission.formSpec.fullName}</div>
        <div>{formSubmission.submissionStatus}</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const ListItemFooter = ({
  formSubmission,
  children,
}: PropsWithChildren<{
  formSubmission: FormSubmission;
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

const FormSubmissionListItem: React.FC<FormSubmissionListItemProps> = ({
  formSubmission,
}) => {
  return (
    <div className="flex flex-col bg-yellow-100 rounded-lg overflow-hidden">
      <ListItemHeader formSubmission={formSubmission} />

      <div className="flex flex-row">
        <div className="p-4 flex-grow overflow-hidden">
          <p>TEST</p>
        </div>
        <div className="py-4 pr-2 w-40">TEST</div>
      </div>
      <ListItemFooter formSubmission={formSubmission} />
    </div>
  );
};

export default FormSubmissionListItem;
