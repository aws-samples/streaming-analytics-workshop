"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cdk = require("@aws-cdk/core");
const iam = require("@aws-cdk/aws-iam");
const logs = require("@aws-cdk/aws-logs");
const lambda = require("@aws-cdk/aws-lambda");
const cloudwatch = require("@aws-cdk/aws-cloudwatch");
const cloudwatch_actions = require("@aws-cdk/aws-cloudwatch-actions");
const sns = require("@aws-cdk/aws-sns");
const subs = require("@aws-cdk/aws-sns-subscriptions");
const core_1 = require("@aws-cdk/core");
const aws_cloudwatch_1 = require("@aws-cdk/aws-cloudwatch");
class WorkshopResources extends cdk.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const addTimestamplambdaSource = fs.readFileSync('lambda/add-approximate-arrival-time.js').toString();
        const enrichEvents = new lambda.Function(this, 'EnrichEventsLambda', {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.inline(addTimestamplambdaSource),
            timeout: core_1.Duration.seconds(60),
            handler: 'index.handler'
        });
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
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.NOT_BREACHING,
            evaluationPeriods: 1,
            statistic: "sum"
        });
        const topic = new sns.Topic(this, 'AppTerminatedTopic');
        topic.addSubscription(new subs.LambdaSubscription(terminateAppLambda));
        alarm.addAlarmAction(new cloudwatch_actions.SnsAction(topic));
    }
}
exports.WorkshopResources = WorkshopResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3Nob3AtcmVzb3VyY2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid29ya3Nob3AtcmVzb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUJBQTBCO0FBQzFCLHFDQUFzQztBQUN0Qyx3Q0FBeUM7QUFDekMsMENBQTJDO0FBQzNDLDhDQUErQztBQUMvQyxzREFBdUQ7QUFDdkQsc0VBQXVFO0FBQ3ZFLHdDQUF5QztBQUN6Qyx1REFBd0Q7QUFDeEQsd0NBQXlDO0FBQ3pDLDREQUErRTtBQU0vRSxNQUFhLGlCQUFrQixTQUFRLEdBQUcsQ0FBQyxTQUFTO0lBQ2hELFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBNkI7UUFDdkUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLHdCQUF3QixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUV0RyxNQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ25FLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDO1lBQ2xELE9BQU8sRUFBRSxlQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QixPQUFPLEVBQUUsZUFBZTtTQUN6QixDQUFDLENBQUM7UUFHSCxNQUFNLDJCQUEyQixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUV6RixNQUFNLGtCQUFrQixHQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDeEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVTtZQUNsQyxPQUFPLEVBQUUsZUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDO1lBQ3JELE9BQU8sRUFBRSxvQkFBb0I7WUFDN0IsVUFBVSxFQUFFLEdBQUc7WUFDZixXQUFXLEVBQUU7Z0JBQ1QsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLE9BQU87YUFDbEM7U0FDSixDQUFDLENBQUM7UUFFSCxrQkFBa0IsQ0FBQyxlQUFlLENBQzlCLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUNwQixPQUFPLEVBQUUsQ0FBQyxrQ0FBa0MsQ0FBQztZQUM3QyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxxQkFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLGdCQUFnQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEksQ0FBQyxDQUNMLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQy9DLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQztZQUN6RixlQUFlLEVBQUUsTUFBTTtZQUN2QixVQUFVLEVBQUUseUJBQXlCO1lBQ3JDLFdBQVcsRUFBRSxHQUFHO1lBQ2hCLFlBQVksRUFBRSxDQUFDO1lBQ2YsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDO1NBQy9FLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUNqQyxTQUFTLEVBQUUsTUFBTTtZQUNqQixVQUFVLEVBQUUseUJBQXlCO1lBQ3JDLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDbEMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDekQsU0FBUyxFQUFFLENBQUM7WUFDWixjQUFjLEVBQUUsSUFBSTtZQUNwQixrQkFBa0IsRUFBRSxtQ0FBa0IsQ0FBQyxzQkFBc0I7WUFDN0QsZ0JBQWdCLEVBQUUsaUNBQWdCLENBQUMsYUFBYTtZQUNoRCxpQkFBaUIsRUFBRSxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxLQUFLO1NBQ25CLENBQUMsQ0FBQztRQUVILE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUV4RCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUV2RSxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksa0JBQWtCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFbEUsQ0FBQztDQUNKO0FBakVELDhDQWlFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuaW1wb3J0IGlhbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1pYW0nKTtcbmltcG9ydCBsb2dzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWxvZ3MnKTtcbmltcG9ydCBsYW1iZGEgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtbGFtYmRhJyk7XG5pbXBvcnQgY2xvdWR3YXRjaCA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1jbG91ZHdhdGNoJyk7XG5pbXBvcnQgY2xvdWR3YXRjaF9hY3Rpb25zID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNsb3Vkd2F0Y2gtYWN0aW9ucycpO1xuaW1wb3J0IHNucyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zbnMnKTtcbmltcG9ydCBzdWJzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXNucy1zdWJzY3JpcHRpb25zJyk7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgVHJlYXRNaXNzaW5nRGF0YSwgQ29tcGFyaXNvbk9wZXJhdG9yIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNsb3Vkd2F0Y2gnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtzaG9wUmVzb3VyY2VzUHJvcHMge1xuICAgIGFwcE5hbWU6IHN0cmluZyxcbn1cblxuZXhwb3J0IGNsYXNzIFdvcmtzaG9wUmVzb3VyY2VzIGV4dGVuZHMgY2RrLkNvbnN0cnVjdCB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBXb3Jrc2hvcFJlc291cmNlc1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICAgICAgY29uc3QgYWRkVGltZXN0YW1wbGFtYmRhU291cmNlID0gZnMucmVhZEZpbGVTeW5jKCdsYW1iZGEvYWRkLWFwcHJveGltYXRlLWFycml2YWwtdGltZS5qcycpLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgY29uc3QgZW5yaWNoRXZlbnRzID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRW5yaWNoRXZlbnRzTGFtYmRhJywge1xuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xMl9YLFxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmlubGluZShhZGRUaW1lc3RhbXBsYW1iZGFTb3VyY2UpLFxuICAgICAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJ1xuICAgICAgICB9KTtcbiAgICBcblxuICAgICAgICBjb25zdCBzdG9wQXBwbGljYXRpb25sYW1iZGFTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoJ2xhbWJkYS9zdG9wLWtkYS1hcHAucHknKS50b1N0cmluZygpO1xuXG4gICAgICAgIGNvbnN0IHRlcm1pbmF0ZUFwcExhbWJkYSA9ICBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdUZXJtaW5hdGVBcHBMYW1iZGEnLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM183LFxuICAgICAgICAgICAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygxNSksXG4gICAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5pbmxpbmUoc3RvcEFwcGxpY2F0aW9ubGFtYmRhU291cmNlKSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdpbmRleC5lbXB0eV9idWNrZXQnLFxuICAgICAgICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbl9uYW1lOiBwcm9wcy5hcHBOYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRlcm1pbmF0ZUFwcExhbWJkYS5hZGRUb1JvbGVQb2xpY3koXG4gICAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uczogWydraW5lc2lzYW5hbHl0aWNzOlN0b3BBcHBsaWNhdGlvbiddLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogW2Bhcm46JHtjZGsuQXdzLlBBUlRJVElPTn06a2luZXNpc2FuYWx5dGljczoke2Nkay5Bd3MuUkVHSU9OfToke2Nkay5Bd3MuQUNDT1VOVF9JRH06YXBwbGljYXRpb24vJHtwcm9wcy5hcHBOYW1lfWBdXG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIG5ldyBsb2dzLk1ldHJpY0ZpbHRlcih0aGlzLCAnQXBwVGVybWluYXRlZEZpbHRlcicsIHtcbiAgICAgICAgICAgIGZpbHRlclBhdHRlcm46IGxvZ3MuRmlsdGVyUGF0dGVybi5saXRlcmFsKCdKb2IgcmVhY2hlZCBnbG9iYWxseSB0ZXJtaW5hbCBzdGF0ZSBGSU5JU0hFRCcpLFxuICAgICAgICAgICAgbWV0cmljTmFtZXNwYWNlOiAnQmVhbScsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnQmVhbUFwcGxpY2F0aW9uRmluaXNoZWQnLFxuICAgICAgICAgICAgbWV0cmljVmFsdWU6ICcxJyxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgICAgICAgIGxvZ0dyb3VwOiBsb2dzLkxvZ0dyb3VwLmZyb21Mb2dHcm91cE5hbWUodGhpcywgJ0tkYUxvZ0dyb3VwJywgcHJvcHMuYXBwTmFtZSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgbWV0cmljID0gbmV3IGNsb3Vkd2F0Y2guTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0JlYW0nLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0JlYW1BcHBsaWNhdGlvbkZpbmlzaGVkJyxcbiAgICAgICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYWxhcm0gPSBtZXRyaWMuY3JlYXRlQWxhcm0odGhpcywgJ0FwcFRlcm1pbmF0ZWRBbGFybScsIHtcbiAgICAgICAgICAgIHRocmVzaG9sZDogMCxcbiAgICAgICAgICAgIGFjdGlvbnNFbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuR1JFQVRFUl9USEFOX1RIUkVTSE9MRCxcbiAgICAgICAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IFRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElORyxcbiAgICAgICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAxLFxuICAgICAgICAgICAgc3RhdGlzdGljOiBcInN1bVwiXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHRvcGljID0gbmV3IHNucy5Ub3BpYyh0aGlzLCAnQXBwVGVybWluYXRlZFRvcGljJyk7XG5cbiAgICAgICAgdG9waWMuYWRkU3Vic2NyaXB0aW9uKG5ldyBzdWJzLkxhbWJkYVN1YnNjcmlwdGlvbih0ZXJtaW5hdGVBcHBMYW1iZGEpKTtcblxuICAgICAgICBhbGFybS5hZGRBbGFybUFjdGlvbihuZXcgY2xvdWR3YXRjaF9hY3Rpb25zLlNuc0FjdGlvbih0b3BpYykpO1xuXG4gICAgfVxufVxuIl19