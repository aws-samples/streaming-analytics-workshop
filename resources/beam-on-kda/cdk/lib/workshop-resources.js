"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cdk = require("@aws-cdk/core");
const iam = require("@aws-cdk/aws-iam");
const lambda = require("@aws-cdk/aws-lambda");
const sns = require("@aws-cdk/aws-sns");
const subs = require("@aws-cdk/aws-sns-subscriptions");
const core_1 = require("@aws-cdk/core");
const github_build_pipeline_1 = require("./github-build-pipeline");
class WorkshopResources extends cdk.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        new github_build_pipeline_1.GithubBuildPipeline(this, 'KinesisReplayBuildPipeline', {
            url: `https://github.com/aws-samples/amazon-kinesis-replay/archive/${props.kinesisReplayVersion}.zip`,
            bucket: props.bucket,
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
        /*
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
        */
        const topic = new sns.Topic(this, 'AppTerminatedTopic');
        new cdk.CfnOutput(this, 'LambdaAlarmTopic', { value: topic.topicName });
        topic.addSubscription(new subs.LambdaSubscription(terminateAppLambda));
        //        alarm.addAlarmAction(new cloudwatch_actions.SnsAction(topic));
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
        props.bucket.grantRead(kdaRole);
    }
}
exports.WorkshopResources = WorkshopResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3Nob3AtcmVzb3VyY2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid29ya3Nob3AtcmVzb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUJBQTBCO0FBRTFCLHFDQUFzQztBQUN0Qyx3Q0FBeUM7QUFFekMsOENBQStDO0FBRy9DLHdDQUF5QztBQUN6Qyx1REFBd0Q7QUFDeEQsd0NBQXlDO0FBR3pDLG1FQUE4RDtBQVE5RCxNQUFhLGlCQUFrQixTQUFRLEdBQUcsQ0FBQyxTQUFTO0lBQ2hELFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBNkI7UUFDdkUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixJQUFJLDJDQUFtQixDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUN4RCxHQUFHLEVBQUUsZ0VBQWdFLEtBQUssQ0FBQyxvQkFBb0IsTUFBTTtZQUNyRyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07WUFDcEIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSx3QkFBd0IsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLHdDQUF3QyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFdEcsTUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUNuRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQztZQUNsRCxPQUFPLEVBQUUsZUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDN0IsT0FBTyxFQUFFLGVBQWU7U0FDekIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRSxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUk3RixNQUFNLDJCQUEyQixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUV6RixNQUFNLGtCQUFrQixHQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDeEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVTtZQUNsQyxPQUFPLEVBQUUsZUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDO1lBQ3JELE9BQU8sRUFBRSxvQkFBb0I7WUFDN0IsVUFBVSxFQUFFLEdBQUc7WUFDZixXQUFXLEVBQUU7Z0JBQ1QsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLE9BQU87YUFDbEM7U0FDSixDQUFDLENBQUM7UUFFSCxrQkFBa0IsQ0FBQyxlQUFlLENBQzlCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUNwQixPQUFPLEVBQUUsQ0FBQyxrQ0FBa0MsQ0FBQztZQUM3QyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxxQkFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLGdCQUFnQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEksQ0FBQyxDQUNMLENBQUM7UUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQXlCRTtRQUVGLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUV4RCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRXhFLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBRS9FLHdFQUF3RTtRQUdoRSxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUMxQyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsZ0NBQWdDLENBQUM7U0FFeEUsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDeEMsT0FBTyxFQUFFO2dCQUNULGdCQUFnQixFQUFFLG1CQUFtQjtnQkFDckMsZUFBZSxFQUFFLG1CQUFtQixFQUFFLGNBQWMsRUFBRSwwQkFBMEI7YUFDL0U7WUFDRCxTQUFTLEVBQUUsQ0FBRSxHQUFHLENBQUU7U0FDckIsQ0FBQyxDQUFDLENBQUM7UUFFSixLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVwQyxDQUFDO0NBQ0o7QUEvRkQsOENBK0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCBzMyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zMycpO1xuaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcbmltcG9ydCBpYW0gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtaWFtJyk7XG5pbXBvcnQgbG9ncyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1sb2dzJyk7XG5pbXBvcnQgbGFtYmRhID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWxhbWJkYScpO1xuaW1wb3J0IGNsb3Vkd2F0Y2ggPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2xvdWR3YXRjaCcpO1xuaW1wb3J0IGNsb3Vkd2F0Y2hfYWN0aW9ucyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1jbG91ZHdhdGNoLWFjdGlvbnMnKTtcbmltcG9ydCBzbnMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3Mtc25zJyk7XG5pbXBvcnQgc3VicyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zbnMtc3Vic2NyaXB0aW9ucycpO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7IFRyZWF0TWlzc2luZ0RhdGEsIENvbXBhcmlzb25PcGVyYXRvciB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jbG91ZHdhdGNoJztcbmltcG9ydCB7IFMzQXJ0aWZhY3RzUHJvcHMgfSBmcm9tICdAYXdzLWNkay9hd3MtY29kZWJ1aWxkJztcbmltcG9ydCB7IEdpdGh1YkJ1aWxkUGlwZWxpbmUgfSBmcm9tICcuL2dpdGh1Yi1idWlsZC1waXBlbGluZSc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBXb3Jrc2hvcFJlc291cmNlc1Byb3BzIHtcbiAgICBhcHBOYW1lOiBzdHJpbmcsXG4gICAgYnVja2V0OiBzMy5CdWNrZXRcbn1cblxuZXhwb3J0IGNsYXNzIFdvcmtzaG9wUmVzb3VyY2VzIGV4dGVuZHMgY2RrLkNvbnN0cnVjdCB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBXb3Jrc2hvcFJlc291cmNlc1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAgICAgbmV3IEdpdGh1YkJ1aWxkUGlwZWxpbmUodGhpcywgJ0tpbmVzaXNSZXBsYXlCdWlsZFBpcGVsaW5lJywge1xuICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly9naXRodWIuY29tL2F3cy1zYW1wbGVzL2FtYXpvbi1raW5lc2lzLXJlcGxheS9hcmNoaXZlLyR7cHJvcHMua2luZXNpc1JlcGxheVZlcnNpb259LnppcGAsXG4gICAgICAgICAgICBidWNrZXQ6IHByb3BzLmJ1Y2tldCxcbiAgICAgICAgICAgIGV4dHJhY3Q6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYWRkVGltZXN0YW1wbGFtYmRhU291cmNlID0gZnMucmVhZEZpbGVTeW5jKCdsYW1iZGEvYWRkLWFwcHJveGltYXRlLWFycml2YWwtdGltZS5qcycpLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgY29uc3QgZW5yaWNoRXZlbnRzID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRW5yaWNoRXZlbnRzTGFtYmRhJywge1xuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xMl9YLFxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmlubGluZShhZGRUaW1lc3RhbXBsYW1iZGFTb3VyY2UpLFxuICAgICAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJ1xuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRmlyZWhvc2VUcmFuZm9ybWF0aW9uTGFtYmRhJywgeyB2YWx1ZTogZW5yaWNoRXZlbnRzLmZ1bmN0aW9uTmFtZSB9KTtcblxuICAgIFxuXG4gICAgICAgIGNvbnN0IHN0b3BBcHBsaWNhdGlvbmxhbWJkYVNvdXJjZSA9IGZzLnJlYWRGaWxlU3luYygnbGFtYmRhL3N0b3Ata2RhLWFwcC5weScpLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgY29uc3QgdGVybWluYXRlQXBwTGFtYmRhID0gIG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1Rlcm1pbmF0ZUFwcExhbWJkYScsIHtcbiAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzcsXG4gICAgICAgICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDE1KSxcbiAgICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmlubGluZShzdG9wQXBwbGljYXRpb25sYW1iZGFTb3VyY2UpLFxuICAgICAgICAgICAgaGFuZGxlcjogJ2luZGV4LmVtcHR5X2J1Y2tldCcsXG4gICAgICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uX25hbWU6IHByb3BzLmFwcE5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGVybWluYXRlQXBwTGFtYmRhLmFkZFRvUm9sZVBvbGljeShcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ2tpbmVzaXNhbmFseXRpY3M6U3RvcEFwcGxpY2F0aW9uJ10sXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbYGFybjoke2Nkay5Bd3MuUEFSVElUSU9OfTpraW5lc2lzYW5hbHl0aWNzOiR7Y2RrLkF3cy5SRUdJT059OiR7Y2RrLkF3cy5BQ0NPVU5UX0lEfTphcHBsaWNhdGlvbi8ke3Byb3BzLmFwcE5hbWV9YF1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLypcbiAgICAgICAgbmV3IGxvZ3MuTWV0cmljRmlsdGVyKHRoaXMsICdBcHBUZXJtaW5hdGVkRmlsdGVyJywge1xuICAgICAgICAgICAgZmlsdGVyUGF0dGVybjogbG9ncy5GaWx0ZXJQYXR0ZXJuLmxpdGVyYWwoJ0pvYiByZWFjaGVkIGdsb2JhbGx5IHRlcm1pbmFsIHN0YXRlIEZJTklTSEVEJyksXG4gICAgICAgICAgICBtZXRyaWNOYW1lc3BhY2U6ICdCZWFtJyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdCZWFtQXBwbGljYXRpb25GaW5pc2hlZCcsXG4gICAgICAgICAgICBtZXRyaWNWYWx1ZTogJzEnLFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxuICAgICAgICAgICAgbG9nR3JvdXA6IGxvZ3MuTG9nR3JvdXAuZnJvbUxvZ0dyb3VwTmFtZSh0aGlzLCAnS2RhTG9nR3JvdXAnLCBwcm9wcy5hcHBOYW1lKVxuICAgICAgICB9KTtcblxuXG4gICAgICAgIGNvbnN0IG1ldHJpYyA9IG5ldyBjbG91ZHdhdGNoLk1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdCZWFtJyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdCZWFtQXBwbGljYXRpb25GaW5pc2hlZCcsXG4gICAgICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDEpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGFsYXJtID0gbWV0cmljLmNyZWF0ZUFsYXJtKHRoaXMsICdBcHBUZXJtaW5hdGVkQWxhcm0nLCB7XG4gICAgICAgICAgICB0aHJlc2hvbGQ6IDAsXG4gICAgICAgICAgICBhY3Rpb25zRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogQ29tcGFyaXNvbk9wZXJhdG9yLkdSRUFURVJfVEhBTl9USFJFU0hPTEQsXG4gICAgICAgICAgICB0cmVhdE1pc3NpbmdEYXRhOiBUcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkcsXG4gICAgICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogXCJzdW1cIlxuICAgICAgICB9KTtcbiAgICAgICAgKi9cblxuICAgICAgICBjb25zdCB0b3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ0FwcFRlcm1pbmF0ZWRUb3BpYycpO1xuXG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMYW1iZGFBbGFybVRvcGljJywgeyB2YWx1ZTogdG9waWMudG9waWNOYW1lIH0pO1xuXG4gICAgICAgIHRvcGljLmFkZFN1YnNjcmlwdGlvbihuZXcgc3Vicy5MYW1iZGFTdWJzY3JpcHRpb24odGVybWluYXRlQXBwTGFtYmRhKSk7XG5cbi8vICAgICAgICBhbGFybS5hZGRBbGFybUFjdGlvbihuZXcgY2xvdWR3YXRjaF9hY3Rpb25zLlNuc0FjdGlvbih0b3BpYykpO1xuXG5cbiAgICAgICAgY29uc3Qga2RhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnS2RhUm9sZScsIHtcbiAgICAgICAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdraW5lc2lzYW5hbHl0aWNzLmFtYXpvbmF3cy5jb20nKSxcblxuICAgICAgICB9KTtcblxuICAgICAgICBrZGFSb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICdsb2dzOkRlc2NyaWJlKicsICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAna2luZXNpczpMaXN0KicsICdraW5lc2lzOkRlc2NyaWJlKicsICdraW5lc2lzOkdldConLCAna2luZXNpczpTdWJzY3JpYmVUb1NoYXJkJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFsgJyonIF1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHByb3BzLmJ1Y2tldC5ncmFudFJlYWQoa2RhUm9sZSk7XG5cbiAgICB9XG59XG4iXX0=