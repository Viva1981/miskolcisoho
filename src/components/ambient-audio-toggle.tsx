"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/branding/miskolci-harangjatek.m4a";
const STORAGE_KEY = "soho-ambient-audio";
const TARGET_VOLUME = 0.58;
const FADE_DURATION_MS = 520;
const PULSE_FALLOFF = 0.82;
const FIRST_PLAY_VOLUME_FALLBACK_MS = 420;

type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

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

async function waitForAudioMetadata(audio: HTMLAudioElement) {
  if (audio.readyState >= 1) {
    return;
  }

  await new Promise<void>((resolve) => {
    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", onReady);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onReady);
    };

    const onReady = () => {
      cleanup();
      resolve();
    };

    audio.addEventListener("loadedmetadata", onReady, { once: true });
    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("error", onReady, { once: true });
  });
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<number | null>(null);
  const pulseFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const resetPulse = useCallback(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    button.style.setProperty("--soho-audio-bg-alpha", "0.76");
    button.style.setProperty("--soho-audio-glow-alpha", "0.08");
    button.style.setProperty("--soho-audio-glow-size", "4px");
  }, []);

  const stopRhythmPulse = useCallback(() => {
    if (pulseFrameRef.current !== null) {
      window.cancelAnimationFrame(pulseFrameRef.current);
      pulseFrameRef.current = null;
    }

    resetPulse();
  }, [resetPulse]);

  const setupAudioAnalyser = useCallback(async () => {
    const audio = audioRef.current;
    const AudioContextConstructor =
      window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;

    if (!audio || !AudioContextConstructor) {
      return null;
    }

    await waitForAudioMetadata(audio);

    let audioContext = audioContextRef.current;

    if (!audioContext) {
      audioContext = new AudioContextConstructor();
      audioContextRef.current = audioContext;
    }

    if (!sourceRef.current) {
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.76;

      sourceRef.current = audioContext.createMediaElementSource(audio);
      sourceRef.current.connect(analyser);
      analyser.connect(audioContext.destination);

      analyserRef.current = analyser;
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return analyserRef.current;
  }, []);

  const startRhythmPulse = useCallback(() => {
    const audio = audioRef.current;
    const analyser = analyserRef.current;
    const frequencyData = frequencyDataRef.current;

    if (!audio || !analyser || !frequencyData) {
      resetPulse();
      return;
    }

    if (pulseFrameRef.current !== null) {
      window.cancelAnimationFrame(pulseFrameRef.current);
    }

    let smoothedPulse = 0;

    const tick = () => {
      const button = buttonRef.current;

      if (!button || audio.paused) {
        pulseFrameRef.current = null;
        resetPulse();
        return;
      }

      analyser.getByteFrequencyData(frequencyData);

      const sampledBins = Math.min(frequencyData.length, 30);
      let weightedEnergy = 0;
      let totalWeight = 0;

      for (let index = 0; index < sampledBins; index += 1) {
        const weight = index < 10 ? 1.25 : 0.82;

        weightedEnergy += frequencyData[index] * weight;
        totalWeight += weight;
      }

      const averageEnergy = totalWeight > 0 ? weightedEnergy / totalWeight : 0;
      const beatEnergy = Math.max(0, averageEnergy / 255 - 0.08) * 1.9;

      smoothedPulse = Math.max(
        Math.min(beatEnergy, 1),
        smoothedPulse * PULSE_FALLOFF,
      );

      button.style.setProperty(
        "--soho-audio-bg-alpha",
        (0.76 + smoothedPulse * 0.24).toFixed(3),
      );
      button.style.setProperty(
        "--soho-audio-glow-alpha",
        (0.08 + smoothedPulse * 0.22).toFixed(3),
      );
      button.style.setProperty(
        "--soho-audio-glow-size",
        `${(4 + smoothedPulse * 16).toFixed(1)}px`,
      );

      pulseFrameRef.current = window.requestAnimationFrame(tick);
    };

    pulseFrameRef.current = window.requestAnimationFrame(tick);
  }, [resetPulse]);

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

      try {
        await setupAudioAnalyser();
        await audio.play();
        setIsPlaying(true);
        fadeTo(TARGET_VOLUME);
        startRhythmPulse();

        window.setTimeout(() => {
          if (!audio.paused && audio.volume < TARGET_VOLUME * 0.4) {
            audio.volume = TARGET_VOLUME;
          }
        }, FIRST_PLAY_VOLUME_FALLBACK_MS);

        if (persist) {
          saveAudioPreference(true);
        }
      } catch {
        setIsPlaying(false);
        stopRhythmPulse();

        if (persist) {
          saveAudioPreference(false);
        }
      }
    },
    [fadeTo, setupAudioAnalyser, startRhythmPulse, stopRhythmPulse],
  );

  const muteAmbient = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    saveAudioPreference(false);
    stopRhythmPulse();

    fadeTo(0, () => {
      audio.pause();
      setIsPlaying(false);
    });
  }, [fadeTo, stopRhythmPulse]);

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

      if (pulseFrameRef.current !== null) {
        window.cancelAnimationFrame(pulseFrameRef.current);
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
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="metadata" />

      <button
        ref={buttonRef}
        type="button"
        className={`soho-audio-toggle ${isPlaying ? "is-playing" : ""}`}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Hang nemitasa" : "Hang bekapcsolasa"}
        title={isPlaying ? "Hang nemitasa" : "Hang bekapcsolasa"}
        onClick={handleToggle}
      >
        <span className="soho-audio-icon" aria-hidden="true">
          <SoundIcon isPlaying={isPlaying} />
        </span>
      </button>
    </div>
  );
}
