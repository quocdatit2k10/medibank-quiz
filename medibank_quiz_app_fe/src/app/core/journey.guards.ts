import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JourneyService } from './journey.service';

/** Learners must finish the video before the quiz unlocks. */
export const videoWatchedGuard: CanActivateFn = () => {
  const journey = inject(JourneyService);
  return journey.videoCompleted() || inject(Router).createUrlTree(['/video']);
};

/** Results only make sense once at least one answer exists. */
export const quizTakenGuard: CanActivateFn = () => {
  const journey = inject(JourneyService);
  return journey.answers().length > 0 || inject(Router).createUrlTree(['/']);
};
