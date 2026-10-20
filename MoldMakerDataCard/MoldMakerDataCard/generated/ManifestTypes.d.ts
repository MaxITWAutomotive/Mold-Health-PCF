/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    toolName: ComponentFramework.PropertyTypes.StringProperty;
    location: ComponentFramework.PropertyTypes.StringProperty;
    runningStatus: ComponentFramework.PropertyTypes.StringProperty;
    currentCycles: ComponentFramework.PropertyTypes.WholeNumberProperty;
    warrantyLimit: ComponentFramework.PropertyTypes.WholeNumberProperty;
    temperatureC: ComponentFramework.PropertyTypes.DecimalNumberProperty;
    lastSensorReading: ComponentFramework.PropertyTypes.StringProperty;
    lastRefresh: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
}
