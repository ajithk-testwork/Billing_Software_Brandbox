"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CameraOff,
  QrCode,
  Search,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  RefreshCw,
  ScanLine,
  ExternalLink,
} from "lucide-react";

type ScanRecord = {
  id: string;
  value: string;
  scannedAt: string;
  orderId?: string;
};

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorLike;

const HISTORY_KEY = "brandbox_qr_scan_history";

function getOrderIdFromQr(value: string): string | null {
  const clean = value.trim();

  // QR created by the Orders page contains a tracking URL.
  try {
    const parsed = new URL(clean, window.location.origin);
    const match = parsed.pathname.match(/\/track\/([^/]+)\/?$/);
    if (match) {
      // Accept local tracking URLs and same-origin absolute URLs only.
      if (
        parsed.origin === window.location.origin ||
        !/^https?:\/\//i.test(clean)
      ) {
        return decodeURIComponent(match[1]);
      }
    }
  } catch {
    // The QR may contain a plain order number instead of a URL.
  }

  // Allow staff to paste/scan a plain order ID such as ORD-1234567.
  if (/^ORD-[A-Z0-9-]+$/i.test(clean)) return clean;

  return null;
}

export default function QRScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const frameRef = useRef<number | null>(null);
  const scanningRef = useRef(false);
  const lastValueRef = useRef("");

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manualValue, setManualValue] = useState("");
  const [latestScan, setLatestScan] = useState("");
  const [latestOrderId, setLatestOrderId] = useState("");
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {
      setHistory([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, loaded]);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const recordScan = useCallback(
    (value: string) => {
      const clean = value.trim();
      if (!clean || clean === lastValueRef.current) return;

      lastValueRef.current = clean;
      const orderId = getOrderIdFromQr(clean);
      const record: ScanRecord = {
        id: `scan-${Date.now()}`,
        value: clean,
        scannedAt: new Date().toISOString(),
        ...(orderId ? { orderId } : {}),
      };

      setLatestScan(clean);
      setLatestOrderId(orderId || "");
      setHistory((previous) => [record, ...previous].slice(0, 30));
      stopCamera();

      if (orderId) {
        setOpening(true);
        // Navigate to the same tracking page opened by a customer's phone camera.
        window.setTimeout(
          () => router.push(`/track/${encodeURIComponent(orderId)}`),
          500,
        );
      }
    },
    [router, stopCamera],
  );

  const scanFrame = useCallback(async () => {
    if (!scanningRef.current || !videoRef.current || !detectorRef.current)
      return;

    try {
      if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const results = await detectorRef.current.detect(videoRef.current);
        const value = results.find((item) => item.rawValue)?.rawValue;
        if (value) {
          recordScan(value);
          return;
        }
      }
    } catch {
      // Continue scanning; an individual frame can fail while the camera adjusts.
    }

    if (scanningRef.current)
      frameRef.current = requestAnimationFrame(scanFrame);
  }, [recordScan]);

  const startCamera = async () => {
    setCameraError("");
    setLatestScan("");
    setLatestOrderId("");
    setOpening(false);
    lastValueRef.current = "";

    const Detector = (
      window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }
    ).BarcodeDetector;
    if (!Detector) {
      setCameraError(
        "QR camera scanning is not supported by this browser. Try the latest Chrome or Edge, or enter the QR value manually.",
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is unavailable. Open this page using HTTPS or localhost and allow camera permission.",
      );
      return;
    }

    try {
      detectorRef.current = new Detector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      scanningRef.current = true;
      setCameraActive(true);
      frameRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      stopCamera();
      const message =
        error instanceof Error ? error.message : "Unable to start camera.";
      setCameraError(
        message.includes("Permission") || message.includes("NotAllowed")
          ? "Camera permission denied. Allow camera access in browser settings and try again."
          : `Unable to start camera: ${message}`,
      );
    }
  };

  useEffect(
    () => () => {
      scanningRef.current = false;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const submitManual = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manualValue.trim()) return;
    recordScan(manualValue);
    setManualValue("");
  };

  const copyResult = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const clearHistory = () => {
    if (!history.length || !window.confirm("Clear all recent QR scans?"))
      return;
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#08A8E0]">
          WORKSPACE / QUICK ACTION
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#142033] md:text-3xl">
          QR Scanner
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Scan a laundry order QR to open its order tracking page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-[#142033]">Camera scanner</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Hold the order QR code inside the frame
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${cameraActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
            >
              {cameraActive ? "Camera active" : "Camera off"}
            </span>
          </div>

          <div className="bg-[#101B2C] p-4 sm:p-6">
            <div className="relative mx-auto flex aspect-[4/3] w-full max-w-[620px] items-center justify-center overflow-hidden rounded-xl bg-[#17263A]">
              <video
                ref={videoRef}
                muted
                playsInline
                className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />
              {!cameraActive && (
                <div className="flex flex-col items-center px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <QrCode size={34} />
                  </div>
                  <p className="font-semibold text-white">Camera is ready</p>
                  <p className="mt-1 max-w-xs text-sm text-slate-300">
                    Start the camera and scan an order QR code.
                  </p>
                </div>
              )}
              {cameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-52 w-52 max-h-[65%] max-w-[65%]">
                    <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-xl border-l-4 border-t-4 border-[#08A8E0]" />
                    <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-xl border-r-4 border-t-4 border-[#08A8E0]" />
                    <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-xl border-b-4 border-l-4 border-[#08A8E0]" />
                    <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-xl border-b-4 border-r-4 border-[#08A8E0]" />
                    <span className="absolute left-2 right-2 top-1/2 h-0.5 animate-pulse bg-[#08A8E0]/80" />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#08A8E0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#078FC1]"
                >
                  <Camera size={17} /> Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <CameraOff size={17} /> Stop Camera
                </button>
              )}
              <button
                onClick={() => {
                  stopCamera();
                  setCameraError("");
                  setLatestScan("");
                  setLatestOrderId("");
                  setOpening(false);
                  lastValueRef.current = "";
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                <RefreshCw size={16} /> Reset
              </button>
            </div>
          </div>

          {cameraError && (
            <div className="m-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{cameraError}</p>
            </div>
          )}

          <div className="border-t border-slate-100 p-5">
            <form onSubmit={submitManual}>
              <label className="mb-2 block text-sm font-semibold text-[#142033]">
                Enter QR value or Order ID manually
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={manualValue}
                    onChange={(event) => setManualValue(event.target.value)}
                    placeholder="Paste tracking URL or ORD-1234567..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#08A8E0] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-[#08A8E0] px-5 text-sm font-semibold text-white hover:bg-[#078FC1]"
                >
                  Open order
                </button>
              </div>
            </form>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ScanLine size={18} className="text-[#08A8E0]" />
              <h2 className="font-bold text-[#142033]">Latest scan</h2>
            </div>
            {latestScan ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={17} /> QR value captured
                </div>
                <div className="break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {latestScan}
                </div>
                {latestOrderId ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-700">
                      Order found: {latestOrderId}
                    </p>
                    <button
                      onClick={() =>
                        router.push(
                          `/track/${encodeURIComponent(latestOrderId)}`,
                        )
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#08A8E0] px-4 py-3 text-sm font-semibold text-white hover:bg-[#078FC1]"
                    >
                      <ExternalLink size={16} />{" "}
                      {opening
                        ? "Opening tracking page..."
                        : "Open order tracking"}
                    </button>
                  </div>
                ) : (
                  <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    This QR value is not a Brandbox order tracking link or Order
                    ID.
                  </p>
                )}
                <button
                  onClick={() => copyResult(latestScan)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Copy size={15} /> {copied ? "Copied" : "Copy value"}
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                <QrCode size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  No QR scanned yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Scan a QR generated from the Orders page.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-[#142033]">Scanner tips</h2>
              <Camera size={17} className="text-slate-400" />
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />{" "}
                Allow camera permission when prompted.
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />{" "}
                Use HTTPS or localhost for camera access.
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />{" "}
                Use Chrome or Edge with QR BarcodeDetector support.
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />{" "}
                Scanning a Brandbox order QR opens its tracking page.
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#08A8E0]" />
            <div>
              <h2 className="font-bold text-[#142033]">Recent scans</h2>
              <p className="text-xs text-slate-500">
                Last {history.length} scan records on this device
              </p>
            </div>
          </div>
          <button
            onClick={clearHistory}
            disabled={!history.length}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={14} /> Clear history
          </button>
        </div>
        {history.length ? (
          <div className="divide-y divide-slate-100">
            {history.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF8FE] text-[#08A8E0]">
                    <QrCode size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold text-[#142033]">
                      {record.orderId || record.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(record.scannedAt)}
                    </p>
                  </div>
                </div>
                {record.orderId && (
                  <button
                    onClick={() =>
                      router.push(
                        `/track/${encodeURIComponent(record.orderId!)}`,
                      )
                    }
                    className="self-start rounded-lg px-3 py-2 text-xs font-semibold text-[#08A8E0] hover:bg-sky-50 sm:self-center"
                  >
                    Open order
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <History size={25} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              No scan history
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Scanned order QR codes will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
