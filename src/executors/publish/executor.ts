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

function logError(message: string) {
  console.error("Nx Publish Executor Error:", message);
}

export default async function runExecutor(
  options: NxPublishExecutorSchema,
  context: { root: string }
) {
  log("Received options", options);

  const projectFolder = path.join(context.root, options.projectFolderPath);

  log("Running yarn npm publish", { projectFolder });

  try {
    const publishCommandArgs = [
      "yarn npm publish",
      ...(options.access ? [`--access ${options.access}`] : []),
    ];

    const { stdout: publishStdout, stderr: publishStderr } = await promisify(
      exec
    )(publishCommandArgs.join(" "), {
      cwd: projectFolder,
    });

    log("Release", { stdout: publishStdout, stderr: publishStderr });

    const gitPushCommand = `git push --atomic --follow-tags`;

    // Git writes to stderr even when there is no error
    const { stdout: gitPushStdout, stderr: gitPushStderr } = await promisify(
      exec
    )(gitPushCommand, {
      cwd: projectFolder,
    });

    log("Git push", { stdout: gitPushStdout, stderr: gitPushStderr });

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logError(error.stdout);

    return { success: false };
  }
}
