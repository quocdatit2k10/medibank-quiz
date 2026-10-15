import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Quiz } from './quiz.models';

/**
 * Loads quiz questions. Today they come from public/data/questions.json;
 * swap the URL for a real API endpoint later without touching the screens.
 */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);
  private readonly quiz$ = this.http.get<Quiz>('data/questions.json').pipe(shareReplay(1));

  getQuiz(): Observable<Quiz> {
    return this.quiz$;
  }

  /** Kahoot-style scoring: up to 1000 points, faster correct answers score more. */
  static score(correct: boolean, secondsLeft: number, secondsTotal: number): number {
    if (!correct) return 0;
    return Math.round(500 + 500 * (secondsLeft / secondsTotal));
  }
}
