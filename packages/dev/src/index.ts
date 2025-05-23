import { releaseChangelog, releasePublish, releaseVersion } from 'nx/release';

(async () => {
  const { workspaceVersion, projectsVersionData } = await releaseVersion({});

  await releaseChangelog({
    versionData: projectsVersionData,
    version: workspaceVersion,
    dryRun: false,
    verbose: false,
  });

  // publishResults contains a map of project names and their exit codes
  const publishResults = await releasePublish({
    dryRun: false,
    verbose: false,
  });

  if(Object.values(publishResults).every((result: any) => result.code === 0)) {
	console.log('All projects published successfully.');
  } else {
	console.log('Some projects failed to publish:', publishResults);
	throw new Error('Some projects failed to publish.');
  }
})();
