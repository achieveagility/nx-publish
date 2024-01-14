# nx-publish

Nx executor for [Yarn](https://yarnpkg.com/) npm publishing.

## Usage

```bash
yarn add -D @aaos/nx-publish
```

Use the executor in an Nx target within `project.json`:

```json
"npm-publish": {
  "executor": "@aaos/nx-publish:publish",
  "options": {
    "projectFolderPath": "./packages/my-package"
  }
}
```

> The `projectFolderPath` is required, pointing to the package folder to publish, and is a relative folder to the repository root.

## Overview

The executor runs the following commands:

```
yarn npm publish
git push --atomic --follow-tags
```

These are useful after versioning packages and creating updated Git tags, for example when using the [semver plugin for Nx](https://github.com/jscutlery/semver).

## Usage with Nx semver

You can follow the documentation for the [Nx semver plugin](https://github.com/jscutlery/semver), using `nx-publish` as a drop-in replacement for `ngx-deploy-npm`:

```json
{
  "name": "@foo/my-package",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "targets": {
    "version": {
      "executor": "@jscutlery/semver:version",
      "options": {
        "postTargets": ["npm-publish", "github-release"]
      }
    },
    "npm-publish": {
      "executor": "@aaos/nx-publish:publish",
      "options": {
        "projectFolderPath": "./packages/my-package"
      }
    },
    "github-release": {
      "executor": "@jscutlery/semver:github",
      "options": {
        "tag": "{tag}",
        "notes": "{notes}"
      }
    }
  }
}
```

## Troubleshooting

> You cannot publish over the previously published versions

The [Nx semver](https://github.com/jscutlery/semver/tree/main) package uses _tags_ alone to determine the next version of your packages. You may have had a successful package publish in the past but the creation of the tag failed for a particular reason.

You can manually create tags for each package yourself in the format expected depending on your semver configuration, e.g:

```
git tag -f @foo/my-package-0.1.1
git push origin @foo/my-package-0.1.1 --force
```

> Git push fails with no repository access

Ensure that the PAT you are using has the following repository access:

- Contents, read and write
- Pull requests, read and write (not required for this particular error, but useful)

> HTTP 403: Resource not accessible by integration (https://api.github.com/repos/.../releases)

Occurs when the Nx semver plugin attempts to create a GitHub release:

- Go to Repository Settings -> Actions -> General
- Under **Workflow Permissions**, ensure:
  - **Read and write Permissions** is enabled
  - **Allow GitHub Actions to create and approve pull requests** is checked (not required for this particular error, but useful)
