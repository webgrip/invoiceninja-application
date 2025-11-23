const branches = [
  'main',
  {
    name: 'release/*',
    prerelease: 'rc'
  }
];

const commitAnalyzerConfig = [
  '@semantic-release/commit-analyzer',
  {
    preset: 'conventionalcommits',
    releaseRules: [
      { type: 'feature', release: 'minor' },
      { type: 'bugfix', release: 'patch' },
      { type: 'hotfix', release: 'patch' }
    ],
    parserOpts: {
      noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
    }
  }
];

const releaseNotesGeneratorConfig = [
  '@semantic-release/release-notes-generator',
  {
    preset: 'conventionalcommits',
    presetConfig: {
      types: [
        { type: 'feat', section: 'Added' },
        { type: 'feature', section: 'Added' },
        { type: 'fix', section: 'Fixed' },
        { type: 'bugfix', section: 'Fixed' },
        { type: 'hotfix', section: 'Fixed' },
        { type: 'perf', section: 'Performance' },
        { type: 'refactor', section: 'Changed' },
        { type: 'chore', section: 'Internal', hidden: true },
        { type: 'docs', section: 'Docs', hidden: true },
        { type: 'test', section: 'Tests', hidden: true }
      ]
    },
    parserOpts: {
      noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
    },
    writerOpts: {
      groupBy: 'type',
      commitGroupsSort: 'title',
      commitsSort: ['type', 'subject'],
      transform: (commit) => {
        if (!commit.scope || !commit.scope.trim()) {
          commit.scope = 'Misc';
        }

        return commit;
      }
    }
  }
];

const changelogConfig = [
  '@semantic-release/changelog',
  {
    changelogFile: 'CHANGELOG.md'
  }
];

const gitConfig = [
  '@semantic-release/git',
  {
    assets: ['CHANGELOG.md'],
    message: 'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}'
  }
];

const execConfig = [
  '@semantic-release/exec',
  {
    successCmd: 'echo "version=${nextRelease.version}" >> $GITHUB_OUTPUT'
  }
];

const mainOnlyPlugins = [changelogConfig, gitConfig];

module.exports = (context = {}) => {
  const branchName = context.branch?.name ?? '';
  const isMainBranch = branchName === 'main';

  const plugins = [
    commitAnalyzerConfig,
    releaseNotesGeneratorConfig,
    ...(isMainBranch ? mainOnlyPlugins : []),
    execConfig,
    '@semantic-release/github'
  ];

  return {
    branches,
    tagFormat: '${version}',
    plugins
  };
};
