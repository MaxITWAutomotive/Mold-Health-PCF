import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class MoldHealth implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container: HTMLDivElement;

    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
                this._container = container;    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._container.innerHTML = `
<div style="
    font-family:Segoe UI;
    padding:16px;
    background:white;
    border-radius:12px;
    border:1px solid #ddd;
">
    <h2>🔧 Mold Health</h2>

    <p>🟢 RUNNING</p>

    <div style="
        width:100%;
        height:20px;
        background:#e0e0e0;
        border-radius:10px;
        overflow:hidden;
    ">
        <div style="
            width:45%;
            height:20px;
            background:#4CAF50;
        ">
        </div>
    </div>

    <p>450,000 / 1,000,000</p>

    <p>Remaining: 550,000 cycles</p>

    <p>🌡️ 25°C</p>
</div>
`;
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
