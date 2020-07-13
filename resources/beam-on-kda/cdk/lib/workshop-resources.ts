import fs = require('fs');
import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import logs = require('@aws-cdk/aws-logs');
import lambda = require('@aws-cdk/aws-lambda');
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import cloudwatch_actions = require('@aws-cdk/aws-cloudwatch-actions');
import sns = require('@aws-cdk/aws-sns');
import subs = require('@aws-cdk/aws-sns-subscriptions');
import { Duration } from '@aws-cdk/core';
import { TreatMissingData, ComparisonOperator } from '@aws-cdk/aws-cloudwatch';

export interface WorkshopResourcesProps {
    appName: string,
}

export class WorkshopResources extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: WorkshopResourcesProps) {
        super(scope, id);

        const addTimestamplambdaSource = fs.readFileSync('lambda/add-approximate-arrival-time.js').toString();

        const enrichEvents = new lambda.Function(this, 'EnrichEventsLambda', {
          runtime: lambda.Runtime.NODEJS_12_X,
          code: lambda.Code.inline(addTimestamplambdaSource),
          timeout: Duration.seconds(60),
          handler: 'index.handler'
        });
    

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

        new logs.MetricFilter(this, 'AppTerminatedFilter', {
            filterPattern: logs.FilterPattern.literal('Job reached globally terminal state FINISHED'),
            metricNamespace: 'Beam',
            metricName: 'BeamApplicationFinished',
            metricValue: '1',
            defaultValue: 0,
            logGroup: logs.LogGroup.fromLogGroupName(this, 'KdaLogGroup', props.appName)
        });

        const metric = new cloudwatch.Metric({
            namespace: 'Beam',
            metricName: 'BeamApplicationFinished',
            period: cdk.Duration.minutes(1)
        });

        const alarm = metric.createAlarm(this, 'AppTerminatedAlarm', {
            threshold: 0,
            actionsEnabled: true,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: TreatMissingData.NOT_BREACHING,
            evaluationPeriods: 1,
            statistic: "sum"
        });

        const topic = new sns.Topic(this, 'AppTerminatedTopic');

        topic.addSubscription(new subs.LambdaSubscription(terminateAppLambda));

        alarm.addAlarmAction(new cloudwatch_actions.SnsAction(topic));

    }
}
