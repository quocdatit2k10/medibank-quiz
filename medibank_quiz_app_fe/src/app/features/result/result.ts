import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { JourneyService } from '../../core/journey.service';
import { QuizService } from '../../core/quiz.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.html',
  styleUrl: './result.scss',
})
export class Result {
  private readonly router = inject(Router);
  protected readonly journey = inject(JourneyService);
  protected readonly quiz = toSignal(inject(QuizService).getQuiz());

  protected readonly total = computed(() => this.quiz()?.questions.length ?? this.journey.answers().length);
  protected readonly percent = computed(() =>
    this.total() ? Math.round((this.journey.correctCount() / this.total()) * 100) : 0,
  );
  protected readonly passed = computed(() => this.percent() >= (this.quiz()?.passMark ?? 0));

  protected readonly review = computed(() => {
    const quiz = this.quiz();
    if (!quiz) return [];
    return this.journey.answers().map((answer) => {
      const q = quiz.questions.find((x) => x.id === answer.questionId)!;
      return {
        ...answer,
        text: q.text,
        correctOption: q.options[q.answerIndex],
        chosenOption: answer.selectedIndex === null ? 'No answer (time ran out)' : q.options[answer.selectedIndex],
      };
    });
  });

  retake(): void {
    this.journey.resetQuiz();
    this.router.navigateByUrl('/quiz');
  }

  rewatch(): void {
    this.router.navigateByUrl('/video');
  }

  home(): void {
    this.router.navigateByUrl('/');
  }
}
