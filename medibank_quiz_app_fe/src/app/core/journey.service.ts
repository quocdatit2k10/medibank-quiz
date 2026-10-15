import { Injectable, computed, signal } from '@angular/core';
import { QuizAnswer } from './quiz.models';

export interface VideoSource {
  url: string;
  name: string;
  /** true when the URL is an object URL we created and must revoke. */
  isObjectUrl: boolean;
}

/** Default video bundled with the app (public/videos/intro.mp4). */
export const DEFAULT_VIDEO: VideoSource = {
  url: 'videos/intro.mp4',
  name: 'OSHC induction',
  isObjectUrl: false,
};

/**
 * Holds the state of one learner journey:
 * notification → video → quiz → result.
 */
@Injectable({ providedIn: 'root' })
export class JourneyService {
  readonly memberName = signal('Alex');

  private readonly _video = signal<VideoSource>(DEFAULT_VIDEO);
  readonly video = this._video.asReadonly();

  /** Quiz is locked until the video has been watched to the end. */
  readonly videoCompleted = signal(false);

  readonly answers = signal<QuizAnswer[]>([]);
  readonly totalPoints = computed(() => this.answers().reduce((sum, a) => sum + a.points, 0));
  readonly correctCount = computed(() => this.answers().filter((a) => a.correct).length);

  /** Load a video file the user picked from their device. */
  useLocalFile(file: File): void {
    this.setVideo({ url: URL.createObjectURL(file), name: file.name, isObjectUrl: true });
  }

  useDefaultVideo(): void {
    this.setVideo(DEFAULT_VIDEO);
  }

  recordAnswer(answer: QuizAnswer): void {
    this.answers.update((list) => [...list, answer]);
  }

  resetQuiz(): void {
    this.answers.set([]);
  }

  /** Start the whole journey again from the home screen. */
  reset(): void {
    this.resetQuiz();
    this.videoCompleted.set(false);
  }

  private setVideo(source: VideoSource): void {
    const previous = this._video();
    if (previous.isObjectUrl) URL.revokeObjectURL(previous.url);
    this._video.set(source);
    this.videoCompleted.set(false);
  }
}
