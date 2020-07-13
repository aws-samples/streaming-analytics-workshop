"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const iam = require("@aws-cdk/aws-iam");
const lambda = require("@aws-cdk/aws-lambda");
const sns = require("@aws-cdk/aws-sns");
const subs = require("@aws-cdk/aws-sns-subscriptions");
const github_build_pipeline_1 = require("./github-build-pipeline");
const core_1 = require("@aws-cdk/core");
const empty_bucket_1 = require("./empty-bucket");
const windows_dev_environment_1 = require("./windows-dev-environment");
class WorkshopInfrastructure extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const bucket = new s3.Bucket(this, 'Bucket', {
            versioned: true
        });
        const emptyBucket = new empty_bucket_1.EmptyBucketOnDelete(this, 'EmptyBucket', {
            bucket: bucket
        });
        new cdk.CfnOutput(this, 'S3Bucket', { value: bucket.bucketName });
        new windows_dev_environment_1.WindowsDevEnvironment(this, 'WindowsDevEnvironment', {
            bucket: bucket,
            kinesisReplayVersion: props.kinesisReplayVersion,
        });
        new github_build_pipeline_1.GithubBuildPipeline(this, 'KinesisReplayBuildPipeline', {
            url: `https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/archive/${props.beamApplicationVersion}.zip`,
            bucket: bucket,
            extract: true
        });
        const addTimestamplambdaSource = fs.readFileSync('lambda/add-approximate-arrival-time.js').toString();
        const enrichEvents = new lambda.Function(this, 'EnrichEventsLambda', {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.inline(addTimestamplambdaSource),
            timeout: core_1.Duration.seconds(60),
            handler: 'index.handler'
        });
        new cdk.CfnOutput(this, 'FirehoseTranformationLambda', { value: enrichEvents.functionName });
        const stopApplicationlambdaSource = fs.readFileSync('lambda/stop-kda-app.py').toString();
        const terminateAppLambda = new lambda.Function(this, 'TerminateAppLambda', {
            runtime: lambda.Runtime.PYTHON_3_7,
            timeout: core_1.Duration.minutes(15),
            code: lambda.Code.inline(stopApplicationlambdaSource),
            handler: 'index.empty_bucket',
            memorySize: 512,
            environment: {
                application_name: props.appName
            }
        });
        terminateAppLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ['kinesisanalytics:StopApplication'],
            resources: [`arn:${cdk.Aws.PARTITION}:kinesisanalytics:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:application/${props.appName}`]
        }));
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
            resources: ['*']
        }));
        bucket.grantRead(kdaRole);
    }
}
exports.WorkshopInfrastructure = WorkshopInfrastructure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3Nob3AtaW5mcmFzdHJ1Y3R1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3b3Jrc2hvcC1pbmZyYXN0cnVjdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUEwQjtBQUMxQixxQ0FBc0M7QUFDdEMsc0NBQXVDO0FBQ3ZDLHdDQUF5QztBQUN6Qyw4Q0FBK0M7QUFDL0Msd0NBQXlDO0FBQ3pDLHVEQUF3RDtBQUN4RCxtRUFBOEQ7QUFDOUQsd0NBQStEO0FBQy9ELGlEQUFxRDtBQUVyRCx1RUFBa0U7QUFlbEUsTUFBYSxzQkFBdUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNuRCxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQWtDO1FBQzlFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBR3hCLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQzNDLFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLElBQUksa0NBQW1CLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUMvRCxNQUFNLEVBQUUsTUFBTTtTQUNmLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBSWxFLElBQUksK0NBQXFCLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQ3ZELE1BQU0sRUFBRSxNQUFNO1lBQ2Qsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLG9CQUFvQjtTQUNqRCxDQUFDLENBQUM7UUFJSCxJQUFJLDJDQUFtQixDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUMxRCxHQUFHLEVBQUUsc0ZBQXNGLEtBQUssQ0FBQyxzQkFBc0IsTUFBTTtZQUM3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ZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcbmltcG9ydCBzMyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zMycpO1xuaW1wb3J0IGlhbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1pYW0nKTtcbmltcG9ydCBsYW1iZGEgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtbGFtYmRhJyk7XG5pbXBvcnQgc25zID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXNucycpO1xuaW1wb3J0IHN1YnMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3Mtc25zLXN1YnNjcmlwdGlvbnMnKTtcbmltcG9ydCB7IEdpdGh1YkJ1aWxkUGlwZWxpbmUgfSBmcm9tICcuL2dpdGh1Yi1idWlsZC1waXBlbGluZSc7XG5pbXBvcnQgeyBSZW1vdmFsUG9saWN5LCBEdXJhdGlvbiwgU3RhY2sgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7IEVtcHR5QnVja2V0T25EZWxldGUgfSBmcm9tICcuL2VtcHR5LWJ1Y2tldCc7XG5cbmltcG9ydCB7IFdpbmRvd3NEZXZFbnZpcm9ubWVudCB9IGZyb20gJy4vd2luZG93cy1kZXYtZW52aXJvbm1lbnQnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya3Nob3BJbmZyYXN0cnVjdHVyZVByb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICAvKlxuICBjb25zdW1lckFwcGxpY2F0aW9uVmVyc2lvbjogU3RyaW5nLFxuICBjb25zdW1lckFwcGxpY2F0aW9uSmFyT2JqZWN0OiBTdHJpbmcsXG4gIGZsaW5rVmVyc2lvbjogU3RyaW5nLFxuICBmbGlua1NjYWxhVmVyc2lvbjogU3RyaW5nXG4gICovXG4gIGtpbmVzaXNSZXBsYXlWZXJzaW9uOiBTdHJpbmcsXG4gIGJlYW1BcHBsaWNhdGlvblZlcnNpb246IFN0cmluZyxcbiAgYXBwTmFtZTogc3RyaW5nLFxufVxuXG5leHBvcnQgY2xhc3MgV29ya3Nob3BJbmZyYXN0cnVjdHVyZSBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogV29ya3Nob3BJbmZyYXN0cnVjdHVyZVByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cblxuICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0J1Y2tldCcsIHtcbiAgICAgIHZlcnNpb25lZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgY29uc3QgZW1wdHlCdWNrZXQgPSBuZXcgRW1wdHlCdWNrZXRPbkRlbGV0ZSh0aGlzLCAnRW1wdHlCdWNrZXQnLCB7XG4gICAgICBidWNrZXQ6IGJ1Y2tldFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1MzQnVja2V0JywgeyB2YWx1ZTogYnVja2V0LmJ1Y2tldE5hbWUgfSk7XG5cblxuXG4gICAgbmV3IFdpbmRvd3NEZXZFbnZpcm9ubWVudCh0aGlzLCAnV2luZG93c0RldkVudmlyb25tZW50Jywge1xuICAgICAgYnVja2V0OiBidWNrZXQsXG4gICAgICBraW5lc2lzUmVwbGF5VmVyc2lvbjogcHJvcHMua2luZXNpc1JlcGxheVZlcnNpb24sXG4gICAgfSk7XG5cblxuICAgIFxuICAgIG5ldyBHaXRodWJCdWlsZFBpcGVsaW5lKHRoaXMsICdLaW5lc2lzUmVwbGF5QnVpbGRQaXBlbGluZScsIHtcbiAgICAgIHVybDogYGh0dHBzOi8vZ2l0aHViLmNvbS9hd3Mtc2FtcGxlcy9hbWF6b24ta2luZXNpcy1hbmFseXRpY3MtYmVhbS10YXhpLWNvbnN1bWVyL2FyY2hpdmUvJHtwcm9wcy5iZWFtQXBwbGljYXRpb25WZXJzaW9ufS56aXBgLFxuICAgICAgYnVja2V0OiBidWNrZXQsXG4gICAgICBleHRyYWN0OiB0cnVlXG4gICAgfSk7XG5cbiAgICBcblxuICAgIGNvbnN0IGFkZFRpbWVzdGFtcGxhbWJkYVNvdXJjZSA9IGZzLnJlYWRGaWxlU3luYygnbGFtYmRhL2FkZC1hcHByb3hpbWF0ZS1hcnJpdmFsLXRpbWUuanMnKS50b1N0cmluZygpO1xuXG4gICAgY29uc3QgZW5yaWNoRXZlbnRzID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRW5yaWNoRXZlbnRzTGFtYmRhJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEyX1gsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5pbmxpbmUoYWRkVGltZXN0YW1wbGFtYmRhU291cmNlKSxcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRmlyZWhvc2VUcmFuZm9ybWF0aW9uTGFtYmRhJywgeyB2YWx1ZTogZW5yaWNoRXZlbnRzLmZ1bmN0aW9uTmFtZSB9KTtcblxuXG5cbiAgICBjb25zdCBzdG9wQXBwbGljYXRpb25sYW1iZGFTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoJ2xhbWJkYS9zdG9wLWtkYS1hcHAucHknKS50b1N0cmluZygpO1xuXG4gICAgY29uc3QgdGVybWluYXRlQXBwTGFtYmRhID0gIG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1Rlcm1pbmF0ZUFwcExhbWJkYScsIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfNyxcbiAgICAgICAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygxNSksXG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmlubGluZShzdG9wQXBwbGljYXRpb25sYW1iZGFTb3VyY2UpLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguZW1wdHlfYnVja2V0JyxcbiAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgYXBwbGljYXRpb25fbmFtZTogcHJvcHMuYXBwTmFtZVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0ZXJtaW5hdGVBcHBMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KFxuICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBhY3Rpb25zOiBbJ2tpbmVzaXNhbmFseXRpY3M6U3RvcEFwcGxpY2F0aW9uJ10sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFtgYXJuOiR7Y2RrLkF3cy5QQVJUSVRJT059OmtpbmVzaXNhbmFseXRpY3M6JHtjZGsuQXdzLlJFR0lPTn06JHtjZGsuQXdzLkFDQ09VTlRfSUR9OmFwcGxpY2F0aW9uLyR7cHJvcHMuYXBwTmFtZX1gXVxuICAgICAgICB9KVxuICAgICk7XG5cbiAgICBjb25zdCB0b3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ0FwcFRlcm1pbmF0ZWRUb3BpYycpO1xuXG4gICAgdG9waWMuYWRkU3Vic2NyaXB0aW9uKG5ldyBzdWJzLkxhbWJkYVN1YnNjcmlwdGlvbih0ZXJtaW5hdGVBcHBMYW1iZGEpKTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMYW1iZGFBbGFybVRvcGljJywgeyB2YWx1ZTogdG9waWMudG9waWNOYW1lIH0pO1xuXG5cblxuXG4gICAgY29uc3Qga2RhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnS2RhUm9sZScsIHtcbiAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2tpbmVzaXNhbmFseXRpY3MuYW1hem9uYXdzLmNvbScpLFxuXG4gICAgfSk7XG5cbiAgICBrZGFSb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAnbG9nczpEZXNjcmliZSonLCAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgICAna2luZXNpczpMaXN0KicsICdraW5lc2lzOkRlc2NyaWJlKicsICdraW5lc2lzOkdldConLCAna2luZXNpczpTdWJzY3JpYmVUb1NoYXJkJyxcbiAgICAgICAgXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbICcqJyBdXG4gICAgfSkpO1xuXG4gICAgYnVja2V0LmdyYW50UmVhZChrZGFSb2xlKTtcblxuICB9XG59Il19