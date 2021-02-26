type Novel = {
  info: string;
  title: string;
  url: string;
};
type NovelResult = {
  id: string;
  novels: Novel[];
  title: string;
};
type CachedNovelInfo = {
  [title: string]: { [url: string]: NovelInfo };
};
type NovelInfo = {
  title: string;
  author: string;
  cover: string;
  volumes: number;
  chapters: number;
};
type NovelTracking = {
  novel: Novel;
  isFavorite: boolean;
  novelInfo: NovelInfo;
  latestDownload: number;
};

export { Novel, NovelResult, CachedNovelInfo, NovelInfo, NovelTracking };
