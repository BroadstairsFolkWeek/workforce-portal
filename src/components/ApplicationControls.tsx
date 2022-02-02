import { Application } from "../interfaces/application";

interface ApplicationControlsProps {
  application: Application;
  editButtonClicked: React.MouseEventHandler<HTMLButtonElement>;
  deleteButtonClicked: React.MouseEventHandler<HTMLButtonElement>;
  uploadDocumentsButtonClicked: React.MouseEventHandler<HTMLButtonElement>;
  applicationSubmitButtonClcked: React.MouseEventHandler<HTMLButtonElement>;
}

const isEditable = (application: Application): boolean => {
  return application.status !== "complete";
};

const isDeletable = (application: Application): boolean => {
  return application.status !== "complete";
};

const isDocumentsUploadable = (application: Application): boolean => {
  return application.status === "documents-required";
};

const isSubmittable = (application: Application): boolean => {
  return application.status === "ready-to-submit";
};

interface ControlsButtonProps {
  text: string;
  className: string;
  buttonClickedHander: React.MouseEventHandler<HTMLButtonElement>;
}
const ControlsButton: React.FC<ControlsButtonProps> = ({
  text,
  className,
  buttonClickedHander,
}) => {
  return (
    <button
      onClick={buttonClickedHander}
      className={`w-full py-2 self-center rounded-full ${className}`}
    >
      {text}
    </button>
  );
};

const ApplicationControls = ({
  application,
  editButtonClicked,
  deleteButtonClicked,
  uploadDocumentsButtonClicked,
  applicationSubmitButtonClcked,
}: ApplicationControlsProps) => {
  const editComponent = isEditable(application) ? (
    <ControlsButton
      text="Edit"
      className="bg-yellow-400"
      buttonClickedHander={editButtonClicked}
    />
  ) : null;

  const deleteComponent = isDeletable(application) ? (
    <ControlsButton
      text="Delete"
      className="bg-red-400"
      buttonClickedHander={deleteButtonClicked}
    />
  ) : null;

  const uploadComponent = isDocumentsUploadable(application) ? (
    <ControlsButton
      text="Upload Documents"
      className="bg-green-400"
      buttonClickedHander={uploadDocumentsButtonClicked}
    />
  ) : null;

  const completeComponent = isSubmittable(application) ? (
    <ControlsButton
      text="Submit application"
      className="bg-blue-300"
      buttonClickedHander={applicationSubmitButtonClcked}
    />
  ) : null;

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        {editComponent}
        {deleteComponent}
        {uploadComponent}
        {completeComponent}
      </div>
    </>
  );
};

export default ApplicationControls;
