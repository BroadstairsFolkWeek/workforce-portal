import { useField } from "formik";

const labelClassNames = "";
const baseTextFieldClassNames =
  "block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ";
const singletextFieldClassNames = baseTextFieldClassNames + " rounded-md mt-1";

interface InputProps {
  name: string;
  label: string;
  description?: string;
  description2?: string;
}

export interface TextInputProps extends InputProps {
  type: string;
  step?: string;
  min?: string;
  max?: string;
}

export interface TextAreaProps extends InputProps {}

export const TextInput: React.FC<TextInputProps> = ({
  name,
  label,
  description,
  ...props
}) => {
  const [field, meta] = useField(name);
  return (
    <>
      <div className="flex flex-row justify-between mt-2">
        <label htmlFor={name} className={labelClassNames}>
          {label}
        </label>
        {meta.touched && meta.error ? (
          <span className="text-red-500">{meta.error}</span>
        ) : null}
      </div>
      {description && <div>{description}</div>}
      <input {...field} {...props} className={singletextFieldClassNames} />
    </>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({
  name,
  label,
  description,
  ...props
}) => {
  const [field, meta] = useField(name);
  return (
    <>
      <div className="flex flex-row justify-between mt-2">
        <label htmlFor={name} className={labelClassNames}>
          {label}
        </label>
        {meta.touched && meta.error ? (
          <span className="text-red-500">{meta.error}</span>
        ) : null}
      </div>
      {description && (
        <div className="px-2 font-extralight text-left">{description}</div>
      )}
      <textarea
        {...field}
        {...props}
        rows={5}
        className={singletextFieldClassNames}
      />
    </>
  );
};
