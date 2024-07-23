import { useMemo } from "react";
import Spinner from "./Spinner";

export interface SpinnerOverlayProps {
  size?: "sm" | "md" | "lg";
  verticalPosition?: "top" | "centre" | "bottom";
}

const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({
  size,
  verticalPosition,
}) => {
  const vpos = useMemo(() => verticalPosition ?? "centre", [verticalPosition]);

  return (
    <div className="absolute w-full h-full top-0 left-0 p-10 flex flex-col bg-white bg-opacity-70">
      {vpos === "centre" || vpos === "bottom" ? (
        <div className="flex-grow" />
      ) : null}
      <Spinner size={size} />
      {vpos === "top" || vpos === "centre" ? (
        <div className="flex-grow" />
      ) : null}
    </div>
  );
};

export default SpinnerOverlay;
