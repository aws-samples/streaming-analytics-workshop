import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import s3 = require('@aws-cdk/aws-s3');
import c9 = require('@aws-cdk/aws-cloud9');
import { GithubBuildPipeline } from "./github-build-pipeline";

export interface Cloud9DevEnvironmentProps extends cdk.StackProps {
    vpc: ec2.Vpc,
    bucket: s3.Bucket,
    repositoryUrl: string,
    kinesisReplayVersion: string,
}

export class Cloud9DevEnvironment extends cdk.Construct {

    constructor(scope: cdk.Construct, id: string, props: Cloud9DevEnvironmentProps) {
        super(scope, id);

        /* Cloud9 environment */
        const name = 'beam-workshop-devenv'
        const instance_profile_name = name + '-profile'
        const subnet = (props.vpc.publicSubnets.map(subnet => subnet.subnetId))[0]

        new GithubBuildPipeline(this, 'KinesisReplayBuildPipeline', {
            url: `https://github.com/aws-samples/amazon-kinesis-replay/archive/${props.kinesisReplayVersion}.zip`,
            bucket: props.bucket,
            extract: true
        });

        //   Copy-S3Object -BucketName "${props.bucket.bucketName}" -KeyPrefix target -LocalFolder "$desktop\\workshop-resources"

        const c9env = new c9.CfnEnvironmentEC2(this, name,
            {
                name: 'beam-workshop-devenv',
                description: 'Cloud9 environment for beam workshop',
                automaticStopTimeMinutes: 30,
                instanceType: 't2.small',
                subnetId: subnet,
                repositories: [
                    {
                        pathComponent: '/code',
                        repositoryUrl: props.repositoryUrl
                    }
                ]
            })

        /* IAM Policy */
        const policy = new iam.PolicyDocument();

        policy.addStatements(new iam.PolicyStatement({
            actions: [
                'ec2:AssociateAddress',
                'cloudwatch:PutMetricData',
                'logs:Describe*', 'logs:PutLogEvents',
                'kinesis:DescribeStream', 'kinesis:ListShards', 'kinesis:GetShardIterator', 'kinesis:GetRecords', 'kinesis:PutRecord', 'kinesis:PutRecords',
                'kinesisanalytics:StartApplication'
            ],
            resources: ['*']
        }));

        policy.addStatements(new iam.PolicyStatement({
            actions: [
                'cloudformation:DescribeStacks'
            ],
            resources: [cdk.Aws.STACK_ID]
        }));

        policy.addStatements(new iam.PolicyStatement({
            actions: [
                's3:GetObject*', 's3:GetBucket*', 's3:List*'
            ],
            resources: [
                props.bucket.bucketArn,
                `${props.bucket.bucketArn}/*`,
                `arn:${cdk.Aws.PARTITION}:s3:::aws-bigdata-blog`,
                `arn:${cdk.Aws.PARTITION}:s3:::aws-bigdata-blog/*`,
            ]
        }));

        const instanceRole = new iam.Role(this, 'InstanceRole', {
            assumedBy: new iam.ServicePrincipal('cloud9.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCloud9Administrator')
            ],
            inlinePolicies: {
                WorkshopPermissions: policy
            }
        });

        const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
            instanceProfileName: instance_profile_name,
            roles: [
                instanceRole.roleName
            ]
        });

        /* Output */
        new cdk.CfnOutput(this, 'Tag',
            {
                exportName: 'Tag',
                description: 'Cloud9 environment ARN',
                value: c9env.attrArn.toString()
            });
        new cdk.CfnOutput(this, 'ProfileName',
            {
                exportName: 'ProfileName',
                description: 'Instance Profile Name',
                value: instance_profile_name
            });
        new cdk.CfnOutput(this, 'ReplayJarS3Url',
            {
                exportName: 'ReplayJarS3Url',
                description: 'S3 Url for the replay jar file',
                value: props.bucket.s3UrlForObject('target')
            });
    }
}