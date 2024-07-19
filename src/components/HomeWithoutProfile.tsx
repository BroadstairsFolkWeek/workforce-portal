export interface HomeWithoutProfile {}

const HomeWithoutProfile: React.FC<HomeWithoutProfile> = () => {
  return (
    <div>
      <div className="space-y-2 text-left">
        <h1 className="text-2xl text-center">
          Welcome to the Broadstairs Folk Week Workforce Portal
        </h1>
        <p>
          Please use this website to manage your membership of the Broadstairs
          Folk Week volunteer workforce.
        </p>
      </div>

      <div className="mt-8">
        <p className="text-xl text-center">
          <a className="m-1 p-1 underline" href="/.auth/login/bcauth">
            Sign Up or Sign In to get started.
          </a>
        </p>
      </div>
    </div>
  );
};

export default HomeWithoutProfile;
