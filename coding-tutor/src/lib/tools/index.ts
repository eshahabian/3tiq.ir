import { quizGeneratorTool } from "./quiz-generator";
import { learningRoadmapTool } from "./learning-roadmap";
import { youtubeSearchTool } from "./youtube-search";
import { peakSuggestTool } from "./peak-suggest";
import { gearChecklistTool } from "./gear-checklist";

export const agentTools = {
  generateQuiz: quizGeneratorTool,
  createRoadmap: learningRoadmapTool,
  searchYouTube: youtubeSearchTool,
  suggestPeak: peakSuggestTool,
  gearChecklist: gearChecklistTool,
};

export {
  quizGeneratorTool,
  learningRoadmapTool,
  youtubeSearchTool,
  peakSuggestTool,
  gearChecklistTool,
};
