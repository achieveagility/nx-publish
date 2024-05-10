import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { NxPublishExecutorSchema } from "./schema";

function log(message: string, data?: unknown) {
  console.log(
    "Nx Publish Executor:",
    message,
    data ? JSON.stringify(data, null, 2) : ""
  );
}

function logError(message: string, data?: unknown) {
  console.error(
    "Nx Publish Executor Error:",
    message,
    data ? JSON.stringify(data, null, 2) : ""
  );
}

async function runCommand({
  commandArgs,
  cwd,
  dryRun,
}: {
  commandArgs: string[];
  cwd: string;
  dryRun: boolean;
}): Promise<{ stdout: string; stderr: string }> {
  const command = commandArgs.join(" ");

  if (dryRun) {
    log("Dry run, skipping command execution.", {
      command,
      cwd,
    });

    return { stdout: "", stderr: "" };
  }

  log("Running command...", { command, cwd });

  const { stdout, stderr } = await promisify(exec)(command, {
    cwd,
  });

  log("Command complete.", { command, stdout, stderr });

  return { stdout, stderr };
}

export default async function runExecutor(
  options: NxPublishExecutorSchema,
  context: { root: string }
) {
  const { packageManager = "yarn", dryRun = false } = options;

  log("Received options", options);

  const projectFolder = path.join(context.root, options.projectFolderPath);

  try {
    const publishCommandArgs = [
      packageManager === "yarn" ? "yarn npm publish" : "pnpm publish",
      ...(options.access ? [`--access ${options.access}`] : []),
    ];

    await runCommand({
      commandArgs: publishCommandArgs,
      cwd: projectFolder,
      dryRun,
    });
  } catch (error) {
    logError("There was an error publishing the package.", error);

    return { success: false };
  }

  if (options.push) {
    try {
      const gitPushCommandArgs = ["git push", "--atomic", "--follow-tags"];

      // Git writes to stderr even when there is no error
      await runCommand({
        commandArgs: gitPushCommandArgs,
        cwd: projectFolder,
        dryRun,
      });
    } catch (error) {
      logError("There was an error running git push.", error);

      return { success: false };
    }
  }

  return { success: true };
}
