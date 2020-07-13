import cdk = require('@aws-cdk/core');
export interface WorkshopResourcesProps {
    appName: string;
}
export declare class WorkshopResources extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: WorkshopResourcesProps);
}
