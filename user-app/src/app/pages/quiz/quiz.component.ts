import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="quiz-placeholder">
      <div class="icon">📝</div>
      <h1>Quiz</h1>
      <p>Quiz content will appear here once an admin publishes an active content package.</p>
      <a routerLink="/" class="back-link">← Back to Home</a>
    </div>
  `,
  styles: [`
    .quiz-placeholder {
      max-width: 500px;
      margin: 80px auto;
      text-align: center;
      padding: 24px;
    }
    .icon { font-size: 3rem; margin-bottom: 16px; }
    h1 { color: #003087; margin-bottom: 12px; }
    p { color: #555; margin-bottom: 24px; }
    .back-link { color: #003087; text-decoration: none; font-weight: 500; }
  `],
})
export class QuizComponent {}
