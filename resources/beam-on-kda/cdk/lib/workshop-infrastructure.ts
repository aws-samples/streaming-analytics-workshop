import fs = require('fs');
import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import iam = require('@aws-cdk/aws-iam');
import lambda = require('@aws-cdk/aws-lambda');
import sns = require('@aws-cdk/aws-sns');
import subs = require('@aws-cdk/aws-sns-subscriptions');
import { GithubBuildPipeline } from './github-build-pipeline';
import { RemovalPolicy, Duration, Stack } from '@aws-cdk/core';
import { EmptyBucketOnDelete } from './empty-bucket';

import { WindowsDevEnvironment } from './windows-dev-environment';


export interface WorkshopInfrastructureProps extends cdk.StackProps {
  /*
  consumerApplicationVersion: String,
  consumerApplicationJarObject: String,
  flinkVersion: String,
  flinkScalaVersion: String
  */
  kinesisReplayVersion: String,
  beamApplicationVersion: String,
  appName: string,
}

export class WorkshopInfrastructure extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: WorkshopInfrastructureProps) {
    super(scope, id, props);


    const bucket = new s3.Bucket(this, 'Bucket', {
      versioned: true
    });

    const emptyBucket = new EmptyBucketOnDelete(this, 'EmptyBucket', {
      bucket: bucket
    });

    new cdk.CfnOutput(this, 'S3Bucket', { value: bucket.bucketName });



    new WindowsDevEnvironment(this, 'WindowsDevEnvironment', {
      bucket: bucket,
      kinesisReplayVersion: props.kinesisReplayVersion,
    });


    
    new GithubBuildPipeline(this, 'KinesisReplayBuildPipeline', {
      url: `https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/archive/${props.beamApplicationVersion}.zip`,
      bucket: bucket,
      extract: true
    });

    

    const addTimestamplambdaSource = fs.readFileSync('lambda/add-approximate-arrival-time.js').toString();

    const enrichEvents = new lambda.Function(this, 'EnrichEventsLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.inline(addTimestamplambdaSource),
      timeout: Duration.seconds(60),
      handler: 'index.handler'
    });

    new cdk.CfnOutput(this, 'FirehoseTranformationLambda', { value: enrichEvents.functionName });



    const stopApplicationlambdaSource = fs.readFileSync('lambda/stop-kda-app.py').toString();

    const terminateAppLambda =  new lambda.Function(this, 'TerminateAppLambda', {
        runtime: lambda.Runtime.PYTHON_3_7,
        timeout: Duration.minutes(15),
        code: lambda.Code.inline(stopApplicationlambdaSource),
        handler: 'index.empty_bucket',
        memorySize: 512,
        environment: {
            application_name: props.appName
        }
    });

    terminateAppLambda.addToRolePolicy(
        new iam.PolicyStatement({
            actions: ['kinesisanalytics:StopApplication'],
            resources: [`arn:${cdk.Aws.PARTITION}:kinesisanalytics:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:application/${props.appName}`]
        })
    );

    const topic = new sns.Topic(this, 'AppTerminatedTopic');

    topic.addSubscription(new subs.LambdaSubscription(terminateAppLambda));

    new cdk.CfnOutput(this, 'LambdaAlarmTopic', { value: topic.topicName });




    const kdaRole = new iam.Role(this, 'KdaRole', {
        assumedBy: new iam.ServicePrincipal('kinesisanalytics.amazonaws.com'),

    });

    kdaRole.addToPolicy(new iam.PolicyStatement({
        actions: [
        'logs:Describe*', 'logs:PutLogEvents',
        'kinesis:List*', 'kinesis:Describe*', 'kinesis:Get*', 'kinesis:SubscribeToShard',
        ],
        resources: [ '*' ]
    }));

    bucket.grantRead(kdaRole);

  }
}