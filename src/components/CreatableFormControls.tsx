import { useCallback, useMemo } from "react";

interface CreatableFormControlsProps {
  newForm: () => void;
}

interface ControlsButtonProps {
  text: string;
  className: string;
  onClicked: () => void;
}

const ControlsButton: React.FC<ControlsButtonProps> = ({
  text,
  className,
  onClicked,
}) => {
  const buttonClickedHander: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        ev.stopPropagation();
        onClicked();
      },
      [onClicked]
    );

  return (
    <button
      onClick={buttonClickedHander}
      className={`w-full py-2 self-center rounded-full ${className}`}
    >
      {text}
    </button>
  );
};

const CreatableFormControls = ({ newForm }: CreatableFormControlsProps) => {
  const newElement = useMemo(() => {
    return (
      <ControlsButton text="New" className="bg-green-400" onClicked={newForm} />
    );
  }, [newForm]);

  return (
    <>
      <div className="flex flex-col gap-2 text-center">{newElement}</div>
    </>
  );
};

export default CreatableFormControls;
