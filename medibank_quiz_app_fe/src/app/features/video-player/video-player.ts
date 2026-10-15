import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyService } from '../../core/journey.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.html',
  styleUrl: './video-player.scss',
})
export class VideoPlayer {
  private readonly router = inject(Router);
  protected readonly journey = inject(JourneyService);

  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  protected readonly playing = signal(false);
  protected readonly muted = signal(false);
  protected readonly currentTime = signal(0);
  protected readonly duration = signal(0);
  /** Furthest point reached — learners can rewind but not skip ahead. */
  protected readonly maxWatched = signal(0);
  protected readonly loadError = signal(false);

  protected readonly progress = computed(() => this.pct(this.currentTime()));
  protected readonly watchedProgress = computed(() => this.pct(this.maxWatched()));
  protected readonly remaining = computed(() => Math.max(0, this.duration() - this.currentTime()));

  private get video(): HTMLVideoElement {
    return this.videoRef().nativeElement;
  }

  togglePlay(): void {
    if (this.video.paused) {
      this.video.play().catch(() => this.playing.set(false));
    } else {
      this.video.pause();
    }
  }

  toggleMute(): void {
    this.video.muted = !this.video.muted;
    this.muted.set(this.video.muted);
  }

  replay(): void {
    this.video.currentTime = 0;
    this.video.play();
  }

  /** Clicking the bar seeks — but never past what has already been watched. */
  seek(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const ratio = (event.clientX - bar.getBoundingClientRect().left) / bar.clientWidth;
    const target = Math.max(0, Math.min(ratio * this.duration(), this.maxWatched()));
    this.video.currentTime = target;
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.journey.useLocalFile(file);
    this.resetPlayback();
    input.value = '';
  }

  useSample(): void {
    this.journey.useDefaultVideo();
    this.resetPlayback();
  }

  startQuiz(): void {
    this.journey.resetQuiz();
    this.router.navigateByUrl('/quiz');
  }

  // ---- <video> events ----

  onLoadedMetadata(): void {
    this.loadError.set(false);
    this.duration.set(this.video.duration || 0);
  }

  onTimeUpdate(): void {
    const t = this.video.currentTime;
    this.currentTime.set(t);
    if (t > this.maxWatched()) this.maxWatched.set(t);
  }

  onSeeking(): void {
    // Blocks skipping ahead via keyboard / picture-in-picture / media keys too.
    if (this.journey.videoCompleted()) return;
    if (this.video.currentTime > this.maxWatched() + 0.75) {
      this.video.currentTime = this.maxWatched();
    }
  }

  onEnded(): void {
    this.playing.set(false);
    this.maxWatched.set(this.duration());
    this.journey.videoCompleted.set(true);
  }

  onError(): void {
    this.loadError.set(true);
    this.playing.set(false);
  }

  protected format(seconds: number): string {
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  private pct(t: number): number {
    const d = this.duration();
    return d ? Math.min(100, (t / d) * 100) : 0;
  }

  private resetPlayback(): void {
    this.playing.set(false);
    this.currentTime.set(0);
    this.maxWatched.set(0);
    this.duration.set(0);
    this.loadError.set(false);
  }
}
