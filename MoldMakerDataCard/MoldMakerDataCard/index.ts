import { IInputs, IOutputs } from "./generated/ManifestTypes";

interface ViewModel {
  toolName: string;
  location: string;
  runningStatus: string;
  isRunning: boolean;
  currentCycles: number;
  warrantyLimit: number;
  temperatureC: number;
  lastSensorReading: string;
  lastRefresh: string;
  percentUsed: number;
  barColor: string;
  remaining: number;
}

function formatInt(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Math.round(value).toLocaleString("en-US");
}

function formatDecimal(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function parseRunningStatus(raw: string | null | undefined): boolean {
  const text = (raw ?? "").trim().toLowerCase();
  if (!text) {
    return false;
  }
  return text === "running" || text === "run" || text === "true" || text === "1" || text === "yes";
}

function clampPercent(current: number, limit: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(limit) || limit <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (current / limit) * 100));
}

/** Green (#107c10) at 0% use → red (#d13438) at 100% use. */
function warrantyBarColor(percentUsed: number): string {
  const t = Math.min(1, Math.max(0, percentUsed / 100));
  const r = Math.round(16 + t * (209 - 16));
  const g = Math.round(124 + t * (52 - 124));
  const b = Math.round(16 + t * (56 - 16));
  return `rgb(${r}, ${g}, ${b})`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function displayText(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? escapeHtml(trimmed) : "&nbsp;";
}

function buildViewModel(inputs: IInputs): ViewModel {
  const currentCycles = Number(inputs.currentCycles.raw ?? 0);
  const warrantyLimit = Number(inputs.warrantyLimit.raw ?? 0);
  const temperatureC = Number(inputs.temperatureC.raw ?? 0);
  const isRunning = parseRunningStatus(inputs.runningStatus.raw);
  const percentUsed = clampPercent(currentCycles, warrantyLimit);
  const remaining = Number.isFinite(warrantyLimit)
    ? Math.max(0, warrantyLimit - (Number.isFinite(currentCycles) ? currentCycles : 0))
    : 0;

  return {
    toolName: inputs.toolName.raw ?? "",
    location: inputs.location.raw ?? "",
    runningStatus: inputs.runningStatus.raw ?? "",
    isRunning,
    currentCycles,
    warrantyLimit,
    temperatureC,
    lastSensorReading: inputs.lastSensorReading.raw ?? "",
    lastRefresh: inputs.lastRefresh.raw ?? "",
    percentUsed,
    barColor: warrantyBarColor(percentUsed),
    remaining,
  };
}

function renderMarkup(model: ViewModel): string {
  const statusClass = model.isRunning ? "itw-mmd-status-pill--running" : "itw-mmd-status-pill--stopped";
  const statusLabel = model.isRunning ? "Running" : "Stopped";
  const progressWidth = model.warrantyLimit > 0 ? model.percentUsed : 0;

  return `
<div class="itw-mmd-form">
  <div class="itw-mmd-field">
    <div class="itw-mmd-label">Tool Name</div>
    <div class="itw-mmd-value">${displayText(model.toolName)}</div>
  </div>
  <div class="itw-mmd-field">
    <div class="itw-mmd-label">Running Status</div>
    <div class="itw-mmd-status-row">
      <span class="itw-mmd-status-pill ${statusClass}">${statusLabel}</span>
    </div>
  </div>
  <div class="itw-mmd-field">
    <div class="itw-mmd-label">Location</div>
    <div class="itw-mmd-value">${displayText(model.location)}</div>
  </div>
  <hr class="itw-mmd-divider" />
  <div class="itw-mmd-field">
    <div class="itw-mmd-label">Cycle Counter</div>
    <div class="itw-mmd-progress-block">
      <div class="itw-mmd-progress-meta">
        <span>${formatInt(model.currentCycles)} cycles</span>
        <span>Warranty ${formatInt(model.warrantyLimit)} (${model.percentUsed.toFixed(2)}% used)</span>
      </div>
      <div class="itw-mmd-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressWidth.toFixed(2)}">
        <div class="itw-mmd-progress-fill" style="width:${progressWidth.toFixed(4)}%;background-color:${model.barColor};"></div>
      </div>
      <div class="itw-mmd-stats">
        <div class="itw-mmd-stat">
          <div class="itw-mmd-stat-label">Remaining cycles</div>
          <div class="itw-mmd-stat-value">${formatInt(model.remaining)}</div>
        </div>
        <div class="itw-mmd-stat">
          <div class="itw-mmd-stat-label">Temperature (°C)</div>
          <div class="itw-mmd-stat-value">${formatDecimal(model.temperatureC)}</div>
        </div>
      </div>
    </div>
  </div>
  <hr class="itw-mmd-divider" />
  <div class="itw-mmd-meta-row">
    <span class="itw-mmd-meta-label">Last Sensor Reading</span>
    <span class="itw-mmd-meta-value">${displayText(model.lastSensorReading)}</span>
  </div>
  <div class="itw-mmd-meta-row">
    <span class="itw-mmd-meta-label">Last Refresh</span>
    <span class="itw-mmd-meta-value">${displayText(model.lastRefresh)}</span>
  </div>
</div>`;
}

export class MoldMakerDataCard implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container!: HTMLDivElement;
  private _host!: HTMLDivElement;

  public init(
    context: ComponentFramework.Context<IInputs>,
    _notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement,
  ): void {
    this._container = container;
    this._host = document.createElement("div");
    this._host.className = "itw-mmd-host";
    this._container.appendChild(this._host);
    this.applyContainerLayout(context);
    this.updateView(context);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.applyContainerLayout(context);
    const model = buildViewModel(context.parameters);
    this._host.innerHTML = renderMarkup(model);
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    this._host.replaceChildren();
    this._container.replaceChildren();
  }

  private applyContainerLayout(context: ComponentFramework.Context<IInputs>): void {
    const width = context.mode.allocatedWidth;
    const height = context.mode.allocatedHeight;

    this._container.style.boxSizing = "border-box";
    this._container.style.width = width > 0 ? `${width}px` : "100%";
    this._container.style.height = height > 0 ? `${height}px` : "auto";
    this._container.style.overflow = "hidden";

    this._host.style.width = "100%";
    this._host.style.height = height > 0 ? "100%" : "auto";
    this._host.style.minHeight = height > 0 ? "100%" : "0";
  }
}
