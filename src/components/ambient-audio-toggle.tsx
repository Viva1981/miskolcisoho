"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/branding/miskolci-harangjatek.m4a";
const STORAGE_KEY = "soho-ambient-audio";
const TARGET_VOLUME = 0.58;
const FADE_DURATION_MS = 520;

function saveAudioPreference(isOn: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, isOn ? "on" : "off");
  } catch {
    // Browsers can block localStorage in private or hardened modes.
  }
}

function getAudioPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function SoundIcon({ isPlaying }: { isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 9.3h3.7L13 5v14l-5.3-4.3H4V9.3Z"
        fill="currentColor"
      />
      {isPlaying ? (
        <>
          <path
            d="M16 8.2a5.2 5.2 0 0 1 0 7.6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="M18.7 5.7a8.8 8.8 0 0 1 0 12.6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </>
      ) : (
        <path
          d="m17 9 4 4m0-4-4 4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.9"
        />
      )}
    </svg>
  );
}

export function AmbientAudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  const fadeTo = useCallback((targetVolume: number, onDone?: () => void) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    const startedAt = window.performance.now();
    const startVolume = audio.volume;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / FADE_DURATION_MS, 1);
      const easedProgress = 1 - (1 - progress) ** 3;

      audio.volume =
        startVolume + (targetVolume - startVolume) * easedProgress;

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      frameRef.current = null;
      onDone?.();
    };

    frameRef.current = window.requestAnimationFrame(tick);
  }, []);

  const playAmbient = useCallback(
    async ({ persist = true }: { persist?: boolean } = {}) => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      audio.loop = true;
      audio.volume = 0;
      setNeedsGesture(false);

      try {
        await audio.play();
        setIsPlaying(true);
        fadeTo(TARGET_VOLUME);

        if (persist) {
          saveAudioPreference(true);
        }
      } catch {
        setIsPlaying(false);
        setNeedsGesture(true);

        if (persist) {
          saveAudioPreference(false);
        }
      }
    },
    [fadeTo],
  );

  const muteAmbient = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    saveAudioPreference(false);
    setNeedsGesture(false);

    fadeTo(0, () => {
      audio.pause();
      setIsPlaying(false);
    });
  }, [fadeTo]);

  useEffect(() => {
    const startTimer =
      getAudioPreference() === "on"
        ? window.setTimeout(() => {
            void playAmbient({ persist: false });
          }, 0)
        : null;

    return () => {
      if (startTimer !== null) {
        window.clearTimeout(startTimer);
      }

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [playAmbient]);

  function handleToggle() {
    if (isPlaying) {
      muteAmbient();
      return;
    }

    void playAmbient();
  }

  return (
    <div className={`soho-audio-dock ${isPlaying ? "is-playing" : ""}`}>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />

      <button
        type="button"
        className={`soho-audio-toggle ${isPlaying ? "is-playing" : ""}`}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Hang nemitasa" : "Hang bekapcsolasa"}
        onClick={handleToggle}
      >
        <span className="soho-audio-icon" aria-hidden="true">
          <SoundIcon isPlaying={isPlaying} />
        </span>

        <span className="soho-audio-copy">
          <span className="soho-audio-title">SOHO SOUND</span>
          <span className="soho-audio-status">
            {isPlaying ? "LIVE" : needsGesture ? "TAP TO PLAY" : "OFF"}
          </span>
        </span>

        <span className="soho-audio-eq" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
      </button>
    </div>
  );
}
