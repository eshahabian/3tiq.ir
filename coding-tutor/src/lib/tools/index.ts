import { quizGeneratorTool } from "./quiz-generator";
import { codeGeneratorTool } from "./code-generator";
import { githubReviewTool } from "./github-review";
import { learningRoadmapTool } from "./learning-roadmap";
import { youtubeSearchTool } from "./youtube-search";
import { context7DocsTool } from "./context7-docs";

export const agentTools = {
  generateQuiz: quizGeneratorTool,
  generateCode: codeGeneratorTool,
  reviewGitHub: githubReviewTool,
  createRoadmap: learningRoadmapTool,
  searchYouTube: youtubeSearchTool,
  fetchDocs: context7DocsTool,
};

export {
  quizGeneratorTool,
  codeGeneratorTool,
  githubReviewTool,
  learningRoadmapTool,
  youtubeSearchTool,
  context7DocsTool,
};
