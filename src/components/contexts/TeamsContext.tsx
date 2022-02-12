import React, { useCallback, useContext, useEffect, useState } from "react";
import { Team } from "../../interfaces/team";

export type ITeamsContext = {
  loaded: boolean;
  teams: Team[];
  error: string | null;
};

const TeamsContext = React.createContext<ITeamsContext>({
  loaded: false,
  teams: [],
  error: null,
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
    } catch (err: any) {
      setError("Error processing teams from server");
      console.log(err);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <TeamsContext.Provider
      value={{
        loaded,
        teams,
        error,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};

const useTeams = () => useContext(TeamsContext);

export { TeamsContextProvider, useTeams };
