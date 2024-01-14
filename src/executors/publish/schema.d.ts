export interface NxPublishExecutorSchema {
  projectFolderPath: string;
  access?: "public" | "restricted";
  push?: boolean;
}
