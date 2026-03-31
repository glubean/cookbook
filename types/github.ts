/**
 * Types for GitHub data-driven test data.
 */

/** Row shape for data/github-users/*.json */
export type GitHubUserCase = {
  username: string;
  expectReposGte: number;
};
