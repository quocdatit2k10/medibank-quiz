import { Routes } from '@angular/router';
import { quizTakenGuard, videoWatchedGuard } from './core/journey.guards';

export const routes: Routes = [
  {
    path: '',
    title: 'Medibank OSHC',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'video',
    title: 'Watch video · Medibank OSHC',
    loadComponent: () => import('./features/video-player/video-player').then((m) => m.VideoPlayer),
  },
  {
    path: 'quiz',
    title: 'Quiz · Medibank OSHC',
    canActivate: [videoWatchedGuard],
    loadComponent: () => import('./features/quiz/quiz').then((m) => m.QuizPage),
  },
  {
    path: 'result',
    title: 'Your result · Medibank OSHC',
    canActivate: [quizTakenGuard],
    loadComponent: () => import('./features/result/result').then((m) => m.Result),
  },
  { path: '**', redirectTo: '' },
];
