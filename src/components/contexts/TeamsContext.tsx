import React, { useCallback, useContext, useEffect, useState } from "react";
import { Team } from "../../interfaces/team";

export type ITeamsContext = {
  loaded: boolean;
  teams: Team[];
  error: string | null;
  getRequirementForTeam: (teamName: string) => Team["requirements"] | null;
  getRequirementsForTeams: (
    ...teamPreferences: Array<string | undefined>
  ) => Array<Team["requirements"]>;
};

const invalidFunction = () => {
  throw new Error(
    "TeamsContext consumer is not wrapped in a corresponding provider."
  );
};

const TeamsContext = React.createContext<ITeamsContext>({
  loaded: false,
  teams: [],
  error: null,
  getRequirementForTeam: invalidFunction,
  getRequirementsForTeams: invalidFunction,
});

const TeamsContextProvider = ({ children }: { children: JSX.Element }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoaded(false);
    try {
      const res = await fetch("/api/teams");
      if (res.status === 200) {
        const json: Team[] = await res.json();
        if (json) {
          setTeams(json);
        }
      }
    } catch (err: unknown) {
      setError("Error processing teams from server");
      console.log(err);
    }

    setLoaded(true);
  }, []);

  const getRequirementForTeam = useCallback(
    (teamName) => {
      const team = teams.find((team) => team.team === teamName);
      if (team && team.requirements) {
        return team.requirements;
      } else {
        return null;
      }
    },
    [teams]
  );

  const getRequirementsForTeams = useCallback(
    (...teamPreferences: Array<string | undefined>) => {
      const teamNames = teamPreferences.filter((pref) => !!pref) as string[];
      const reqs = teamNames
        .map(getRequirementForTeam)
        .filter((req) => !!req) as Array<Team["requirements"]>;
      return reqs;
    },
    [getRequirementForTeam]
  );

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <TeamsContext.Provider
      value={{
        loaded,
        teams,
        error,
        getRequirementForTeam,
        getRequirementsForTeams,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};

const useTeams = () => useContext(TeamsContext);

export { TeamsContextProvider, useTeams };
