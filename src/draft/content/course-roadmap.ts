// Reuse the existing official titles verbatim; lesson titles remain separate.
import { lesson02Topics } from './daejeon-lesson02';
export const officialTopics = lesson02Topics;
export type TopicNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface TopicProgressItem {
  topic: TopicNumber;
  status: string;
  note?: string;
}
