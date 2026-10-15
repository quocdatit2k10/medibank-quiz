import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JourneyService } from '../../core/journey.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="intro">
        <span class="pill">Medibank OSHC</span>
        <h1 class="title">Welcome, {{ journey.memberName() }}</h1>
      </div>

      <p class="lead">Your cover and health support, all in one place.</p>

      <div class="card">
        <h2 class="cover">OSHC</h2>
        <p class="hint">Active student cover</p>
      </div>

      @if (journey.answers().length) {
        <a class="card card--link" routerLink="/result">
          <strong>OSHC essentials · completed</strong>
          <span class="hint">{{ journey.totalPoints() }} points — view result</span>
        </a>
      } @else {
        <p class="hint">Use “Simulate push notification” to start this journey.</p>
      }
    </section>
  `,
  styles: `
    .intro {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
    .cover {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    .card--link {
      display: flex;
      flex-direction: column;
      gap: 4px;
      color: inherit;
      text-decoration: none;
    }
  `,
})
export class Home {
  protected readonly journey = inject(JourneyService);
}
