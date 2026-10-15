import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { JourneyService } from './core/journey.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  protected readonly journey = inject(JourneyService);

  protected readonly notificationVisible = signal(false);
  protected readonly clock = '9:41';

  simulatePush(): void {
    this.notificationVisible.set(false);
    // Re-trigger the slide-in animation if it is pressed twice.
    queueMicrotask(() => this.notificationVisible.set(true));
  }

  openNotification(): void {
    this.notificationVisible.set(false);
    this.router.navigateByUrl('/video');
  }

  dismissNotification(event: Event): void {
    event.stopPropagation();
    this.notificationVisible.set(false);
  }

  resetJourney(): void {
    this.notificationVisible.set(false);
    this.journey.reset();
    this.router.navigateByUrl('/');
  }
}
