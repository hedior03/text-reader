import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerDurationDisplay,
  AudioPlayerElement,
  AudioPlayerMuteButton,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerVolumeRange,
} from "@/components/ai-elements/audio-player";
import {
  Transcription,
  TranscriptionSegment,
} from "@/components/ai-elements/transcription";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_auth/app/reader/")({
  component: ReaderPage,
});

type AudioData = {
  base64: string;
  mediaType: string;
  format: string;
  uint8Array: Uint8Array;
};

type Segment = { text: string; startSecond: number; endSecond: number };

type Voice = "coral" | "sage";

const MAX_TEXT_LENGTH = 10_000;

function ReaderPage() {
  const [instructions, setInstructions] = useState("");
  const [text, setText] = useState("");
  const [voice, setVoice] = useState<Voice>("coral");
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [segments, setSegments] = useState<Segment[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Callback ref: audioEl is null until the <audio> element mounts
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const isTextTooLong = text.length > MAX_TEXT_LENGTH;
  const canGenerate = text.trim().length > 0 && !isTextTooLong && !isLoading;

  // Bridge audio time to state via timeupdate events
  useEffect(() => {
    if (!audioEl) return;
    const handleTimeUpdate = () => setCurrentTime(audioEl.currentTime);
    audioEl.addEventListener("timeupdate", handleTimeUpdate);
    return () => audioEl.removeEventListener("timeupdate", handleTimeUpdate);
  }, [audioEl]);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    setAudioData(null);
    setSegments(null);
    setCurrentTime(0);

    try {
      const res = await fetch("/api/ai/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          instructions: instructions.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const base64: string = data.audio.base64;
      setAudioData({
        ...data.audio,
        uint8Array: Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
      });
      setSegments(data.segments ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Read Aloud</h1>
        <Button render={<Link to="/app" />} variant="ghost" size="sm">
          Back
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="instructions" className="text-sm font-medium">
          Persona description
        </label>
        <Textarea
          id="instructions"
          placeholder="e.g. Speak with a warm British accent, calm and measured pace, like a BBC narrator"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
        />
        <p className="text-muted-foreground text-xs">
          Optional. Describes how the voice should sound — accent, tone, pace, emotion.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="text" className="text-sm font-medium">
          Text to read
        </label>
        <Textarea
          id="text"
          placeholder="Paste or type the text you want read aloud..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
        />
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            {text.length > 0
              ? `${text.length.toLocaleString()} / ${MAX_TEXT_LENGTH.toLocaleString()} characters`
              : null}
          </p>
          {isTextTooLong && (
            <p className="text-destructive text-xs font-medium">Text is too long</p>
          )}
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="voice-select" className="text-sm font-medium">
            Voice
          </label>
          <Select value={voice} onValueChange={(v) => setVoice(v as Voice)}>
            <SelectTrigger id="voice-select" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coral">Coral</SelectItem>
              <SelectItem value="sage">Sage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerate} disabled={!canGenerate}>
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md border border-current/20 p-3 text-sm">
          {error}
        </div>
      )}

      {audioData && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Playback</p>
            <AudioPlayer className="rounded-md border p-2">
              <AudioPlayerElement ref={setAudioEl} data={audioData} />
              <AudioPlayerControlBar>
                <AudioPlayerSeekBackwardButton />
                <AudioPlayerPlayButton />
                <AudioPlayerSeekForwardButton />
                <AudioPlayerTimeDisplay />
                <AudioPlayerTimeRange />
                <AudioPlayerDurationDisplay />
                <AudioPlayerMuteButton />
                <AudioPlayerVolumeRange />
              </AudioPlayerControlBar>
            </AudioPlayer>
          </div>

          {segments && segments.length > 0 && (
            <div className="rounded-lg bg-muted/30 p-4">
              <Transcription
                segments={segments}
                currentTime={currentTime}
                onSeek={(time) => {
                  if (audioEl) {
                    audioEl.currentTime = time;
                  }
                }}
                className="text-lg leading-relaxed"
              >
                {(segment, index) => (
                  <TranscriptionSegment key={index} segment={segment} index={index} />
                )}
              </Transcription>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
