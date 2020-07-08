import cdk = require('@aws-cdk/core');
export interface WorkshopInfrastructureProps extends cdk.StackProps {
    kinesisReplayVersion: String;
}
export declare class WorkshopInfrastructure extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: WorkshopInfrastructureProps);
}
