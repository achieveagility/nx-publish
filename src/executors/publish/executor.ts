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

export default async function runExecutor(
  options: NxPublishExecutorSchema,
  context: { root: string }
) {
  log("Received options", options);

  const projectFolder = path.join(context.root, options.projectFolderPath);

  try {
    log("Running yarn npm publish...", { projectFolder });

    const publishCommandArgs = [
      "yarn npm publish",
      ...(options.access ? [`--access ${options.access}`] : []),
    ];

    const { stdout: publishStdout, stderr: publishStderr } = await promisify(
      exec
    )(publishCommandArgs.join(" "), {
      cwd: projectFolder,
    });

    log("Publish complete.", { stdout: publishStdout, stderr: publishStderr });
  } catch (error) {
    logError("There was an error publishing the package.", error);

    return { success: false };
  }

  if (options.push) {
    try {
      log("Running git push...");

      const gitPushCommandArgs = ["git push", "--atomic", "--follow-tags"];

      // Git writes to stderr even when there is no error
      const { stdout: gitPushStdout, stderr: gitPushStderr } = await promisify(
        exec
      )(gitPushCommandArgs.join(" "), {
        cwd: projectFolder,
      });

      log("Git push complete.", {
        stdout: gitPushStdout,
        stderr: gitPushStderr,
      });
    } catch (error) {
      logError("There was an error running git push.", error);

      return { success: false };
    }
  }

  return { success: true };
}
