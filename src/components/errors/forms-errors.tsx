export const SaveFormError = () => {
  return (
    <div className="bg-red-100 rounded-lg overflow-hidden">
      <p className="my-2">There was an error saving the form.</p>
      <p className="my-2">Please referesh the page and try again.</p>
    </div>
  );
};

export const LoadFormError = () => {
  return (
    <div className="bg-red-100 rounded-lg overflow-hidden">
      <p className="my-2">There was an error loading the forms.</p>
      <p className="my-2">Please referesh the page and try again.</p>
    </div>
  );
};
