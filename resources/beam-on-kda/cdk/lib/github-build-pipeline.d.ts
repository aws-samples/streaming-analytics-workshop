import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import cfn = require('@aws-cdk/aws-cloudformation');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import codebuild = require('@aws-cdk/aws-codebuild');
export interface GithubBuildPipelineProps {
    url: string;
    bucket: s3.Bucket;
    extract: boolean;
    objectKey?: string;
    buildspec?: codebuild.BuildSpec;
    sourceAction?: codepipeline_actions.S3SourceAction;
}
export declare class GithubBuildPipeline extends cdk.Construct {
    buildSuccessWaitCondition: cfn.CfnWaitCondition;
    constructor(scope: cdk.Construct, id: string, props: GithubBuildPipelineProps);
}
