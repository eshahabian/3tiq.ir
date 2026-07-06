import { tool } from "ai";
import { z } from "zod";
import { Octokit } from "@octokit/rest";

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function fetchRepoData(owner: string, repo: string) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
  });

  const [repoData, languages, readme, issues, pulls] = await Promise.all([
    octokit.repos.get({ owner, repo }),
    octokit.repos.listLanguages({ owner, repo }),
    octokit.repos
      .getReadme({ owner, repo })
      .catch(() => null),
    octokit.issues
      .listForRepo({ owner, repo, state: "open", per_page: 5 })
      .catch(() => ({ data: [] })),
    octokit.pulls
      .list({ owner, repo, state: "open", per_page: 5 })
      .catch(() => ({ data: [] })),
  ]);

  let readmeContent = "";
  if (readme?.data) {
    readmeContent = Buffer.from(readme.data.content, "base64")
      .toString("utf-8")
      .slice(0, 3000);
  }

  const langEntries = Object.entries(languages.data);
  const totalBytes = langEntries.reduce((sum, [, bytes]) => sum + bytes, 0);
  const langPercentages = langEntries
    .map(([lang, bytes]) => ({
      lang,
      percent: Math.round((bytes / totalBytes) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);

  return {
    name: repoData.data.full_name,
    description: repoData.data.description,
    stars: repoData.data.stargazers_count,
    forks: repoData.data.forks_count,
    openIssues: repoData.data.open_issues_count,
    defaultBranch: repoData.data.default_branch,
    topics: repoData.data.topics ?? [],
    languages: langPercentages,
    readme: readmeContent,
    recentIssues: issues.data.slice(0, 3).map((i) => i.title),
    recentPRs: pulls.data.slice(0, 3).map((p) => p.title),
    createdAt: repoData.data.created_at,
    updatedAt: repoData.data.updated_at,
    hasWiki: repoData.data.has_wiki,
    license: repoData.data.license?.spdx_id ?? "None",
  };
}

export const githubReviewTool = tool({
  description:
    "Review a GitHub repository and provide educational feedback on code quality, structure, and best practices. Use when user shares a GitHub URL or asks to review a project.",
  inputSchema: z.object({
    repositoryUrl: z
      .string()
      .describe("Full GitHub repository URL, e.g. https://github.com/user/repo"),
    focusAreas: z
      .array(z.string())
      .optional()
      .describe("Specific areas to focus on, e.g. architecture, testing, documentation"),
  }),
  execute: async ({ repositoryUrl, focusAreas }) => {
    const parsed = parseGitHubUrl(repositoryUrl);
    if (!parsed) {
      return {
        error: "Invalid GitHub URL. Please provide a valid repository URL.",
      };
    }

    try {
      const data = await fetchRepoData(parsed.owner, parsed.repo);
      return {
        repository: data.name,
        url: repositoryUrl,
        overview: {
          description: data.description,
          stars: data.stars,
          forks: data.forks,
          openIssues: data.openIssues,
          license: data.license,
          topics: data.topics,
        },
        techStack: data.languages,
        readmeExcerpt: data.readme || "No README found",
        activity: {
          recentIssues: data.recentIssues,
          recentPRs: data.recentPRs,
          lastUpdated: data.updatedAt,
        },
        focusAreas: focusAreas ?? ["structure", "documentation", "best-practices"],
        instruction:
          "Based on this repository data, provide a detailed educational review covering: project structure, code organization, documentation quality, potential improvements, and learning points for the student.",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        error: `Failed to fetch repository: ${message}. Make sure the repo is public.`,
      };
    }
  },
});
