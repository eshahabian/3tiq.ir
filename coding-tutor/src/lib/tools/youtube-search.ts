import { tool } from "ai";
import { z } from "zod";

interface YouTubeVideo {
  title: string;
  channel: string;
  videoId: string;
  url: string;
  description: string;
  publishedAt: string;
}

async function searchYouTubeAPI(query: string): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "5",
    relevanceLanguage: "fa",
    key: apiKey,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.items ?? []).map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        description: string;
        publishedAt: string;
      };
    }) => ({
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      description: item.snippet.description.slice(0, 200),
      publishedAt: item.snippet.publishedAt,
    }),
  );
}

export const youtubeSearchTool = tool({
  description:
    "Find educational YouTube videos related to a programming topic. Use when user asks to find videos, tutorials, or visual learning resources.",
  inputSchema: z.object({
    topic: z
      .string()
      .describe("Topic to search for, e.g. 'FastAPI Authentication tutorial'"),
    language: z
      .enum(["fa", "en", "any"])
      .default("any")
      .describe("Preferred video language"),
  }),
  execute: async ({ topic, language }) => {
    const searchQuery =
      language === "fa"
        ? `${topic} آموزش فارسی`
        : language === "en"
          ? `${topic} tutorial`
          : topic;

    const videos = await searchYouTubeAPI(searchQuery);

    if (videos.length > 0) {
      return {
        type: "youtube_results",
        topic,
        videos,
        instruction:
          "Present these videos to the student with brief descriptions and recommend the best ones based on their level.",
      };
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    return {
      type: "youtube_search_fallback",
      topic,
      searchUrl,
      instruction: `YouTube API key not configured or no results found. Provide the search link and recommend well-known educational channels for "${topic}". Suggest searching on YouTube with query: "${searchQuery}".`,
    };
  },
});
