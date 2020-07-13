import cdk = require('@aws-cdk/core');
export interface WorkshopInfrastructureProps extends cdk.StackProps {
    kinesisReplayVersion: String;
    consumerApplicationVersion: String;
    consumerApplicationJarObject: String;
    flinkVersion: String;
    flinkScalaVersion: String;
}
export declare class WorkshopInfrastructure extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: WorkshopInfrastructureProps);
}
