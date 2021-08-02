import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import s3 = require('@aws-cdk/aws-s3');
import c9 = require('@aws-cdk/aws-cloud9');
import { GithubBuildPipeline } from "./github-build-pipeline";

export interface Cloud9DevEnvironmentProps extends cdk.StackProps {
    vpc: ec2.Vpc,
    bucket: s3.Bucket,
    beamSourceRepositoryUrl: string,
    kinesisReplayVersion: string,
    eventEngine: boolean
}

export class Cloud9DevEnvironment extends cdk.Construct {

    constructor(scope: cdk.Construct, id: string, props: Cloud9DevEnvironmentProps) {
        super(scope, id);

        new GithubBuildPipeline(this, 'KinesisReplayBuildPipeline', {
            url: `https://github.com/aws-samples/amazon-kinesis-replay/archive/${props.kinesisReplayVersion}.zip`,
            bucket: props.bucket,
            extract: true
        });
      
        const owner =  props.eventEngine ? {ownerArn: `arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:assumed-role/TeamRole/MasterKey`} : {};

        const c9env = new c9.CfnEnvironmentEC2(this, 'Cloud9Instance', {
            instanceType: 't3.large',
            subnetId: props.vpc.publicSubnets[0].subnetId,
            description: 'Cloud9 environment for Apache Beam on KDA workshop',
            name: cdk.Aws.STACK_NAME,
            repositories: [
                {
                    pathComponent: '/code',
                    repositoryUrl: props.beamSourceRepositoryUrl
                }
            ],
            ...owner
        })

        new cdk.CfnOutput(this, 'ReplayJarS3Url', {
            exportName: 'ReplayJarS3Url',
            description: 'S3 Url for the replay jar file',
            value: props.bucket.s3UrlForObject('target')
        });
    }
}