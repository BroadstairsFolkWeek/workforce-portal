import { useSelector } from "react-redux";
import { selectCreatableForms } from "../features/forms/forms-slice";
import CreatableFormsList from "../components/CreatableFormsList";

const CreatableFormsRoute = () => {
  const creatableForms = useSelector(selectCreatableForms);

  return <CreatableFormsList creatableForms={creatableForms} />;
};

export default CreatableFormsRoute;
