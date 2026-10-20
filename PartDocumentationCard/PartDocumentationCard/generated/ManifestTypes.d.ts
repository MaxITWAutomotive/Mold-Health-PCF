/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    partTitle: ComponentFramework.PropertyTypes.StringProperty;
    drawingNumber: ComponentFramework.PropertyTypes.StringProperty;
    revision: ComponentFramework.PropertyTypes.StringProperty;
    attachmentFiles: ComponentFramework.PropertyTypes.DataSet;
}
export interface IOutputs {
    selectedFileUrl?: string;
    selectedFileName?: string;
}
