import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import cfn = require('@aws-cdk/aws-cloudformation');
export interface EmptyBucketOnDeleteProps {
    bucket: s3.Bucket;
}
export declare class EmptyBucketOnDelete extends cdk.Construct {
    customResource: cfn.CfnCustomResource;
    constructor(scope: cdk.Construct, id: string, props: EmptyBucketOnDeleteProps);
}
