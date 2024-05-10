export interface NxPublishExecutorSchema {
  projectFolderPath: string;
  packageManager?: "yarn" | "pnpm";
  access?: "public" | "restricted";
  push?: boolean;
  dryRun?: boolean;
}
