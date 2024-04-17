export type Team = {
  dbId: number;
  team: string;
  description: string;
  displayOrder: number;
  requirements?: "DBS" | "Drivers License" | undefined;
};
