import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  apiStatus = 'Checking API…';
  hasContent = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<{ status: string }>('/api/health').subscribe({
      next: (res) => {
        this.apiStatus = res.status === 'ok' ? '✅ API connected' : '⚠️ Unexpected response';
      },
      error: () => {
        this.apiStatus = '❌ API offline — start the backend';
      },
    });
  }
}
