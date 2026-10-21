import { useEffect, useState, useRef } from "react";
import { HTTP_BACKEND_URL } from "../../config";
import { LuLoader2, LuAlertCircle, LuRefreshCw } from "react-icons/lu";
import toast from "react-hot-toast";

export type BackendConnectionState = "checking" | "connected" | "disconnected";

// Gentle audio notification ("tek / chime") using Web Audio API (no external file needed)
function playConnectedSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Soft high chime (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio context may be suspended before user interaction, safely ignore
  }
}

export function BackendStatusIndicator() {
  const [status, setStatus] = useState<BackendConnectionState>("checking");
  const [isMinimized, setIsMinimized] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const checkCountRef = useRef(0);
  const hasAnnouncedRef = useRef(false);

  async function checkBackend(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${HTTP_BACKEND_URL}/api/capabilities`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    // Track elapsed seconds while waiting for backend to wake up
    const intervalTimer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    async function probe() {
      checkCountRef.current += 1;
      const isOnline = await checkBackend();
      if (!isMounted) return;

      if (isOnline) {
        setStatus("connected");
        clearInterval(intervalTimer);

        if (!hasAnnouncedRef.current) {
          hasAnnouncedRef.current = true;
          playConnectedSound();

          // Elegant pop-up toast notification
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } pointer-events-auto flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-zinc-900/90 px-4 py-3 text-white shadow-2xl backdrop-blur-md transition-all dark:bg-zinc-950/95`}
              >
                <div className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-400">
                    Backend Terhubung!
                  </p>
                  <p className="text-[11px] text-zinc-300">
                    Server aktif dan siap memproses screenshot & code.
                  </p>
                </div>
              </div>
            ),
            { duration: 4000, id: "backend-connected-toast" }
          );

          // Auto-minimize the floating indicator to a compact dot after 5 seconds
          setTimeout(() => {
            if (isMounted) setIsMinimized(true);
          }, 5000);
        }
      } else {
        // If not connected yet, retry every 3.5s (useful when Render is cold-starting)
        if (checkCountRef.current > 15) {
          // After ~50s of continuous failures, mark as disconnected
          setStatus("disconnected");
        } else {
          setStatus("checking");
          timer = setTimeout(probe, 3500);
        }
      }
    }

    probe();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(intervalTimer);
    };
  }, []);

  async function handleRetry() {
    setStatus("checking");
    setElapsedSeconds(0);
    checkCountRef.current = 0;
    const isOnline = await checkBackend();
    if (isOnline) {
      setStatus("connected");
      hasAnnouncedRef.current = true;
      playConnectedSound();
      toast.success("Backend terhubung!", { duration: 3000 });
      setTimeout(() => setIsMinimized(true), 4000);
    } else {
      setStatus("disconnected");
      toast.error("Gagal terhubung ke backend. Periksa URL server.", { duration: 4000 });
    }
  }

  // Compact minimized badge when connected
  if (status === "connected" && isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-40 hidden sm:block">
        <button
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur-md transition-all hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          title="Backend is connected and active"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono tracking-tight">API Live</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40 max-w-sm">
      {status === "checking" && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-50/90 px-3.5 py-2 text-xs font-medium text-amber-800 shadow-lg backdrop-blur-md dark:border-amber-500/30 dark:bg-zinc-900/90 dark:text-amber-300">
          <LuLoader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
          <div className="flex flex-col">
            <span className="font-semibold">Menghubungkan ke Backend...</span>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
              {elapsedSeconds > 5
                ? `Server sedang bangun (${elapsedSeconds}s) - Render Cold Start`
                : "Mengecek status server..."}
            </span>
          </div>
        </div>
      )}

      {status === "connected" && !isMinimized && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/95 px-3.5 py-2 text-xs font-medium text-emerald-800 shadow-xl backdrop-blur-md dark:border-emerald-500/40 dark:bg-zinc-900/95 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold">Backend Terhubung!</span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-[10px] text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 ml-2 underline"
          >
            Tutup
          </button>
        </div>
      )}

      {status === "disconnected" && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-50/95 px-3.5 py-2 text-xs font-medium text-rose-800 shadow-xl backdrop-blur-md dark:border-rose-500/30 dark:bg-zinc-900/95 dark:text-rose-300 animate-in fade-in slide-in-from-top-2">
          <LuAlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold">Backend Belum Terhubung</span>
            <span className="text-[10px] text-rose-700/80 dark:text-rose-400/80">
              Pastikan server Render aktif & URL sudah benar.
            </span>
          </div>
          <button
            onClick={handleRetry}
            className="ml-1 flex items-center gap-1 rounded-lg bg-rose-600/10 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-600/20 dark:bg-rose-500/20 dark:text-rose-300"
            title="Coba hubungkan lagi"
          >
            <LuRefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

export default BackendStatusIndicator;
