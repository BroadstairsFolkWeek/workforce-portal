import { useSelector } from "react-redux";
import { Params, useLoaderData } from "react-router-dom";

import { selectCreatableForm } from "../features/forms/forms-slice";
import { FormSpecId } from "../interfaces/form";
import CreatableFormNew from "../components/CreatableFormNew";

export async function CreatableFormNewRouteLoader({
  params,
}: {
  params: Params;
}) {
  const creatableFormId = params.creatableFormId;
  return { creatableFormId };
}

const CreatableFormNewRoute = () => {
  const { creatableFormId } = useLoaderData() as Awaited<
    ReturnType<typeof CreatableFormNewRouteLoader>
  >;

  if (creatableFormId) {
    const creatableForm = useSelector(
      selectCreatableForm(FormSpecId.make(creatableFormId))
    );
    if (creatableForm) {
      return <CreatableFormNew creatableForm={creatableForm} />;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default CreatableFormNewRoute;
