import { DateTime } from "luxon";
import { DatePicker } from "@fluentui/react";
import { useField } from "formik";
import { useCallback, useEffect, useState } from "react";

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

interface DateInputProps {
  name: string;
  label: string;
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

export const DateInput: React.FC<DateInputProps> = ({ name, label }) => {
  const [field, , helper] = useField(name);
  const [dateValue, setDateValue] = useState<DateTime | null>(null);

  const dateSelectedHandler = useCallback(
    (date: Date | null | undefined) => {
      if (date) {
        const dateTime = DateTime.fromJSDate(date);
        setDateValue(dateTime);
        helper.setValue(dateTime.toISODate());
      } else {
        helper.setValue(null);
        setDateValue(null);
      }
    },
    [helper]
  );

  useEffect(() => {
    if (field.value) {
    } else {
      setDateValue(null);
    }
  }, [field.value]);

  return (
    <>
      <DatePicker
        label={label}
        placeholder="Select a date..."
        ariaLabel="Select the from date"
        value={dateValue ? dateValue.toJSDate() : undefined}
        onSelectDate={dateSelectedHandler}
      />
    </>
  );
};
