import s3 = require('@aws-cdk/aws-s3');
import cdk = require('@aws-cdk/core');
export interface WorkshopResourcesProps {
    appName: string;
    bucket: s3.Bucket;
}
export declare class WorkshopResources extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: WorkshopResourcesProps);
}
