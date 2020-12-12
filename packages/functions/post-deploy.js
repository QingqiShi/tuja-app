const fs = require('fs-extra');

const packageJsonPath = './package.json';
const packageJson = require(packageJsonPath);

(async () => {
  const localDeps = Object.keys(packageJson.dependencies).filter((depName) =>
    depName.startsWith('@tuja/')
  );
  for (let i = 0; i < localDeps.length; i++) {
    const packageName = localDeps[i].replace('@tuja/', '');
    await fs.remove(`./packages/${packageName}`);

    packageJson.dependencies[localDeps[i]] = '^0.0.0';

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }
})();
