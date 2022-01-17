export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const Spinner: React.FC<SpinnerProps> = ({ size }) => {
  let sizeClassName: string;
  switch (size) {
    case "sm":
      sizeClassName = "w-8 h-8";
      break;

    case "md":
      sizeClassName = "w-16 h-16";
      break;

    case "lg":
    default:
      sizeClassName = "w-32 h-32";
      break;
  }

  return (
    <div
      className={`mx-auto ${sizeClassName} rounded-full bg-horse-white bg-black bg-contain bg-no-repeat bg-center animate-spin`}
    ></div>
  );
};

export default Spinner;
