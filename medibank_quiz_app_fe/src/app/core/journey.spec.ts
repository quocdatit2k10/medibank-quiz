import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { JourneyService } from './journey.service';
import { QuizService } from './quiz.service';
import { routes } from '../app.routes';

describe('QuizService.score', () => {
  it('gives 0 for wrong answers', () => {
    expect(QuizService.score(false, 20, 20)).toBe(0);
  });

  it('rewards faster correct answers', () => {
    expect(QuizService.score(true, 20, 20)).toBe(1000);
    expect(QuizService.score(true, 10, 20)).toBe(750);
    expect(QuizService.score(true, 0, 20)).toBe(500);
  });
});

describe('JourneyService', () => {
  let journey: JourneyService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
    journey = TestBed.inject(JourneyService);
  });

  it('totals points and correct answers', () => {
    journey.recordAnswer({ questionId: 1, selectedIndex: 0, correct: true, points: 900 });
    journey.recordAnswer({ questionId: 2, selectedIndex: 1, correct: false, points: 0 });
    expect(journey.totalPoints()).toBe(900);
    expect(journey.correctCount()).toBe(1);
  });

  it('keeps the quiz locked until the video is complete', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/quiz');
    expect(router.url).toBe('/video');

    journey.videoCompleted.set(true);
    await router.navigateByUrl('/quiz');
    expect(router.url).toBe('/quiz');
  });
});
