import {
  Dropdown,
  IDropdownOption,
  IDropdownStyles,
  IRenderFunction,
} from "@fluentui/react";
import { useField } from "formik";
import { useCallback, useMemo } from "react";
import { useTeams } from "../contexts/TeamsContext";

interface TeamPreferenceFieldProps {
  name: string;
  label: string;
  placeholder?: string;
}

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 270 },
  dropdownOptionText: { overflow: "visible", whiteSpace: "normal" },
  dropdownItem: { height: "auto" },
  dropdownItemSelected: { height: "auto" },
};

const renderTitle: IRenderFunction<IDropdownOption[]> = (props) => {
  const text = props?.map((p) => p.key).join(", ");
  return <span>{text}</span>;
};

const renderOption: IRenderFunction<IDropdownOption> = (option) => {
  if (option) {
    return (
      <div>
        <p className="text-lg">{option.key}</p> <p>{option.text}</p>
      </div>
    );
  } else {
    return <div>Unknown</div>;
  }
};

export const TeamPreferenceField: React.FC<TeamPreferenceFieldProps> = ({
  name,
  label,
  placeholder,
}) => {
  const [field, , helper] = useField(name);
  const { teams } = useTeams();

  const options: IDropdownOption[] = useMemo(() => {
    return teams.map((team) => {
      return {
        key: team.team,
        text: team.description,
      };
    });
  }, [teams]);

  const onChangeHandler = useCallback(
    (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (option) {
        helper.setValue(option.key);
      } else {
        helper.setValue("");
      }
    },
    [helper]
  );

  return (
    <div className="flex gap-4 items-end">
      <Dropdown
        className="flex-grow"
        options={options}
        placeholder={placeholder}
        label={label}
        onChange={onChangeHandler}
        selectedKey={field.value ? [field.value] : null}
        onRenderTitle={renderTitle}
        onRenderOption={renderOption}
        // onRenderItem={renderOption}
        styles={dropdownStyles}
      />
      <button
        className="block px-4 py-2 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none"
        disabled={!field.value}
        onClick={() => {
          helper.setValue(null);
          console.log("Button clicked");
        }}
      >
        Clear
      </button>
    </div>
  );
};
