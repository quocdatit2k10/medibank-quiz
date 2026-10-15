import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { JourneyService } from '../../core/journey.service';
import { Quiz } from '../../core/quiz.models';
import { QuizService } from '../../core/quiz.service';

type Phase = 'answering' | 'revealed';
type LoadState = { status: 'loading' } | { status: 'ready'; quiz: Quiz } | { status: 'error' };

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class QuizPage {
  private readonly router = inject(Router);
  private readonly journey = inject(JourneyService);

  protected readonly state = toSignal(
    inject(QuizService)
      .getQuiz()
      .pipe(
        map((quiz): LoadState => ({ status: 'ready', quiz })),
        catchError(() => of<LoadState>({ status: 'error' })),
      ),
    { initialValue: { status: 'loading' } as LoadState },
  );

  protected readonly quiz = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.quiz : null;
  });

  protected readonly index = signal(0);
  protected readonly phase = signal<Phase>('answering');
  protected readonly selected = signal<number | null>(null);
  protected readonly secondsLeft = signal(0);
  protected readonly lastPoints = signal(0);

  protected readonly question = computed(() => this.quiz()?.questions[this.index()] ?? null);
  protected readonly total = computed(() => this.quiz()?.questions.length ?? 0);
  protected readonly isLast = computed(() => this.index() === this.total() - 1);
  protected readonly timerPct = computed(() => {
    const q = this.quiz();
    return q ? (this.secondsLeft() / q.secondsPerQuestion) * 100 : 0;
  });
  protected readonly secondsShown = computed(() => Math.ceil(this.secondsLeft()));
  protected readonly score = this.journey.totalPoints;

  protected readonly shapes = ['▲', '◆', '●', '■'];

  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    // Start the timer each time a new question appears.
    effect(() => {
      const quiz = this.quiz();
      this.index();
      if (quiz) untracked(() => this.startTimer(quiz.secondsPerQuestion));
    });
    inject(DestroyRef).onDestroy(() => this.stopTimer());
  }

  choose(optionIndex: number): void {
    if (this.phase() !== 'answering') return;
    this.reveal(optionIndex);
  }

  next(): void {
    if (this.isLast()) {
      this.router.navigateByUrl('/result');
      return;
    }
    this.selected.set(null);
    this.phase.set('answering');
    this.index.update((i) => i + 1);
  }

  retry(): void {
    location.reload();
  }

  protected optionState(i: number): 'correct' | 'wrong' | 'dim' | null {
    const q = this.question();
    if (this.phase() !== 'revealed' || !q) return null;
    if (i === q.answerIndex) return 'correct';
    if (i === this.selected()) return 'wrong';
    return 'dim';
  }

  private reveal(optionIndex: number | null): void {
    const quiz = this.quiz();
    const q = this.question();
    if (!quiz || !q) return;
    this.stopTimer();

    const correct = optionIndex === q.answerIndex;
    const points = QuizService.score(correct, this.secondsLeft(), quiz.secondsPerQuestion);
    this.selected.set(optionIndex);
    this.lastPoints.set(points);
    this.phase.set('revealed');
    this.journey.recordAnswer({ questionId: q.id, selectedIndex: optionIndex, correct, points });
  }

  private startTimer(seconds: number): void {
    this.stopTimer();
    const endsAt = Date.now() + seconds * 1000;
    this.secondsLeft.set(seconds);
    this.timer = setInterval(() => {
      const left = Math.max(0, (endsAt - Date.now()) / 1000);
      this.secondsLeft.set(left);
      if (left === 0) this.reveal(null);
    }, 100);
  }

  private stopTimer(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
