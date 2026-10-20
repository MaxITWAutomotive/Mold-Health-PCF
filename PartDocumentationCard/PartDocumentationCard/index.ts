import { IInputs, IOutputs } from "./generated/ManifestTypes";

interface FileRow {
  id: string;
  fileName: string;
  fileUrl: string;
  extension: string;
  isPdf: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extensionFromName(name: string, explicitExt: string): string {
  const ext = (explicitExt || "").trim().replace(/^\./, "").toLowerCase();
  if (ext) {
    return ext;
  }
  const match = /\.([a-z0-9]+)$/i.exec(name.trim());
  return match ? match[1].toLowerCase() : "";
}

function iconClass(ext: string): string {
  if (ext === "pdf") {
    return "itw-pdc-file-icon--pdf";
  }
  if (ext === "xlsx" || ext === "xls") {
    return "itw-pdc-file-icon--xlsx";
  }
  if (ext === "doc" || ext === "docx") {
    return "itw-pdc-file-icon--doc";
  }
  return "itw-pdc-file-icon--default";
}

function iconLabel(ext: string): string {
  if (!ext) {
    return "FILE";
  }
  return ext.length <= 4 ? ext.toUpperCase() : ext.slice(0, 4).toUpperCase();
}

function readFiles(context: ComponentFramework.Context<IInputs>): FileRow[] {
  const dataset = context.parameters.attachmentFiles;
  if (!dataset || dataset.loading) {
    return [];
  }
  const rows: FileRow[] = [];
  dataset.sortedRecordIds.forEach((id) => {
    const record = dataset.records[id];
    if (!record) {
      return;
    }
    const fileName = record.getFormattedValue("fileName") ?? "";
    const fileUrl = record.getFormattedValue("fileUrl") ?? "";
    if (!fileName.trim() && !fileUrl.trim()) {
      return;
    }
    const extension = extensionFromName(fileName, record.getFormattedValue("fileExtension") ?? "");
    rows.push({
      id,
      fileName: fileName.trim() || fileUrl,
      fileUrl: fileUrl.trim(),
      extension,
      isPdf: extension === "pdf",
    });
  });
  return rows;
}

export class PartDocumentationCard implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container!: HTMLDivElement;
  private _host!: HTMLDivElement;
  private _context!: ComponentFramework.Context<IInputs>;
  private _selectedFileId: string | null = null;
  private _selectedFileUrl = "";
  private _selectedFileName = "";
  private _notifyOutputChanged!: () => void;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement,
  ): void {
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;
    this._host = document.createElement("div");
    this._host.className = "itw-pdc-host";
    this._host.addEventListener("click", this.onHostClick);
    this._container.appendChild(this._host);
    this.applyContainerLayout(context);
    this.render(context);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;
    this.applyContainerLayout(context);
    this.render(context);
  }

  public getOutputs(): IOutputs {
    return {
      selectedFileUrl: this._selectedFileUrl,
      selectedFileName: this._selectedFileName,
    };
  }

  public destroy(): void {
    this._host.removeEventListener("click", this.onHostClick);
    this._host.replaceChildren();
    this._container.replaceChildren();
  }

  private onHostClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const fileBtn = target.closest("[data-file-id]") as HTMLElement | null;
    if (fileBtn?.dataset.fileId) {
      this._selectedFileId = fileBtn.dataset.fileId;
      this.render(this._context);
    }
  };

  private applyContainerLayout(context: ComponentFramework.Context<IInputs>): void {
    const width = context.mode.allocatedWidth;
    const height = context.mode.allocatedHeight;
    this._container.style.boxSizing = "border-box";
    this._container.style.width = width > 0 ? `${width}px` : "100%";
    this._container.style.height = height > 0 ? `${height}px` : "auto";
    this._host.style.width = "100%";
    this._host.style.height = height > 0 ? `${height}px` : "auto";
  }

  private syncSelectedOutputs(files: FileRow[]): void {
    const selected = files.find((f) => f.id === this._selectedFileId) ?? null;
    const url = selected?.fileUrl ?? "";
    const name = selected?.fileName ?? "";
    if (url === this._selectedFileUrl && name === this._selectedFileName) {
      return;
    }
    this._selectedFileUrl = url;
    this._selectedFileName = name;
    this._notifyOutputChanged();
  }

  private render(context: ComponentFramework.Context<IInputs>): void {
    const partTitle = (context.parameters.partTitle.raw ?? "").trim() || "Part documentation";
    const drawingNumber = (context.parameters.drawingNumber.raw ?? "").trim();
    const revision = (context.parameters.revision.raw ?? "").trim();
    const files = readFiles(context);

    if (files.length > 0 && (!this._selectedFileId || !files.some((f) => f.id === this._selectedFileId))) {
      const firstPdf = files.find((f) => f.isPdf && f.fileUrl);
      this._selectedFileId = firstPdf?.id ?? files[0].id;
    }
    if (files.length === 0) {
      this._selectedFileId = null;
    }

    this.syncSelectedOutputs(files);

    const selected = files.find((f) => f.id === this._selectedFileId) ?? null;

    const fileListHtml =
      files.length === 0
        ? `<div class="itw-pdc-files-empty">No files. Bind the <strong>attachmentFiles</strong> dataset Items to your SharePoint attachment collection.</div>`
        : files
            .map((file) => {
              const selectedClass = file.id === this._selectedFileId ? " itw-pdc-file-row--selected" : "";
              return `<button type="button" class="itw-pdc-file-row${selectedClass}" data-file-id="${escapeHtml(file.id)}" title="${escapeHtml(file.fileName)}">
  <span class="itw-pdc-file-icon ${iconClass(file.extension)}">${iconLabel(file.extension)}</span>
  <span class="itw-pdc-file-name">${escapeHtml(file.fileName)}</span>
</button>`;
            })
            .join("");

    const selectionHtml = selected
      ? `<div class="itw-pdc-selection">
  <span class="itw-pdc-selection-label">Selected for preview</span>
  <span class="itw-pdc-selection-name">${escapeHtml(selected.fileName)}</span>
  <span class="itw-pdc-selection-hint">Add a PDF Viewer control and set Document to this component&apos;s <strong>SelectedFileUrl</strong> output.</span>
</div>`
      : `<div class="itw-pdc-selection itw-pdc-selection--empty">Select a file to drive the canvas PDF Viewer.</div>`;

    this._host.innerHTML = `
<div class="itw-pdc-card">
  <div class="itw-pdc-header">${escapeHtml(partTitle)}</div>
  <div class="itw-pdc-body">
    <div class="itw-pdc-fields">
      <div>
        <div class="itw-pdc-field-label">Drawing Number</div>
        <div class="itw-pdc-field-value">${drawingNumber ? escapeHtml(drawingNumber) : "&nbsp;"}</div>
      </div>
      <div>
        <div class="itw-pdc-field-label">Revision</div>
        <div class="itw-pdc-field-value itw-pdc-revision-value">${revision ? escapeHtml(revision) : "&nbsp;"}</div>
      </div>
    </div>
    <div class="itw-pdc-files" role="list">${fileListHtml}</div>
  </div>
  <div class="itw-pdc-footer">${selectionHtml}</div>
</div>`;
  }
}
