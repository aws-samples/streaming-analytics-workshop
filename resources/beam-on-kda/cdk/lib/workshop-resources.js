"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cdk = require("@aws-cdk/core");
const iam = require("@aws-cdk/aws-iam");
const logs = require("@aws-cdk/aws-logs");
const lambda = require("@aws-cdk/aws-lambda");
const cloudwatch = require("@aws-cdk/aws-cloudwatch");
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
        //        alarm.addAlarmAction(new cloudwatch_actions.SnsAction(topic));
    }
}
exports.WorkshopResources = WorkshopResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3Nob3AtcmVzb3VyY2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid29ya3Nob3AtcmVzb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUJBQTBCO0FBQzFCLHFDQUFzQztBQUN0Qyx3Q0FBeUM7QUFDekMsMENBQTJDO0FBQzNDLDhDQUErQztBQUMvQyxzREFBdUQ7QUFFdkQsd0NBQXlDO0FBQ3pDLHVEQUF3RDtBQUN4RCx3Q0FBeUM7QUFDekMsNERBQStFO0FBTS9FLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLFNBQVM7SUFDaEQsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUE2QjtRQUN2RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sd0JBQXdCLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXRHLE1BQU0sWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDbkUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUM7WUFDbEQsT0FBTyxFQUFFLGVBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzdCLE9BQU8sRUFBRSxlQUFlO1NBQ3pCLENBQUMsQ0FBQztRQUdILE1BQU0sMkJBQTJCLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXpGLE1BQU0sa0JBQWtCLEdBQUksSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUN4RSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLE9BQU8sRUFBRSxlQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUM7WUFDckQsT0FBTyxFQUFFLG9CQUFvQjtZQUM3QixVQUFVLEVBQUUsR0FBRztZQUNmLFdBQVcsRUFBRTtnQkFDVCxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsT0FBTzthQUNsQztTQUNKLENBQUMsQ0FBQztRQUVILGtCQUFrQixDQUFDLGVBQWUsQ0FDOUIsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3BCLE9BQU8sRUFBRSxDQUFDLGtDQUFrQyxDQUFDO1lBQzdDLFNBQVMsRUFBRSxDQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLHFCQUFxQixHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsZ0JBQWdCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoSSxDQUFDLENBQ0wsQ0FBQztRQUVGLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDL0MsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDhDQUE4QyxDQUFDO1lBQ3pGLGVBQWUsRUFBRSxNQUFNO1lBQ3ZCLFVBQVUsRUFBRSx5QkFBeUI7WUFDckMsV0FBVyxFQUFFLEdBQUc7WUFDaEIsWUFBWSxFQUFFLENBQUM7WUFDZixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUM7U0FDL0UsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ2pDLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLFVBQVUsRUFBRSx5QkFBeUI7WUFDckMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNsQyxDQUFDLENBQUM7UUFFSCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUN6RCxTQUFTLEVBQUUsQ0FBQztZQUNaLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLGtCQUFrQixFQUFFLG1DQUFrQixDQUFDLHNCQUFzQjtZQUM3RCxnQkFBZ0IsRUFBRSxpQ0FBZ0IsQ0FBQyxhQUFhO1lBQ2hELGlCQUFpQixFQUFFLENBQUM7WUFDcEIsU0FBUyxFQUFFLEtBQUs7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRXhELEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBRS9FLHdFQUF3RTtJQUVwRSxDQUFDO0NBQ0o7QUFqRUQsOENBaUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgaWFtID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWlhbScpO1xuaW1wb3J0IGxvZ3MgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtbG9ncycpO1xuaW1wb3J0IGxhbWJkYSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1sYW1iZGEnKTtcbmltcG9ydCBjbG91ZHdhdGNoID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNsb3Vkd2F0Y2gnKTtcbmltcG9ydCBjbG91ZHdhdGNoX2FjdGlvbnMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2xvdWR3YXRjaC1hY3Rpb25zJyk7XG5pbXBvcnQgc25zID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXNucycpO1xuaW1wb3J0IHN1YnMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3Mtc25zLXN1YnNjcmlwdGlvbnMnKTtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5pbXBvcnQgeyBUcmVhdE1pc3NpbmdEYXRhLCBDb21wYXJpc29uT3BlcmF0b3IgfSBmcm9tICdAYXdzLWNkay9hd3MtY2xvdWR3YXRjaCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya3Nob3BSZXNvdXJjZXNQcm9wcyB7XG4gICAgYXBwTmFtZTogc3RyaW5nLFxufVxuXG5leHBvcnQgY2xhc3MgV29ya3Nob3BSZXNvdXJjZXMgZXh0ZW5kcyBjZGsuQ29uc3RydWN0IHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IFdvcmtzaG9wUmVzb3VyY2VzUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICBjb25zdCBhZGRUaW1lc3RhbXBsYW1iZGFTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoJ2xhbWJkYS9hZGQtYXBwcm94aW1hdGUtYXJyaXZhbC10aW1lLmpzJykudG9TdHJpbmcoKTtcblxuICAgICAgICBjb25zdCBlbnJpY2hFdmVudHMgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdFbnJpY2hFdmVudHNMYW1iZGEnLCB7XG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEyX1gsXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuaW5saW5lKGFkZFRpbWVzdGFtcGxhbWJkYVNvdXJjZSksXG4gICAgICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInXG4gICAgICAgIH0pO1xuICAgIFxuXG4gICAgICAgIGNvbnN0IHN0b3BBcHBsaWNhdGlvbmxhbWJkYVNvdXJjZSA9IGZzLnJlYWRGaWxlU3luYygnbGFtYmRhL3N0b3Ata2RhLWFwcC5weScpLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgY29uc3QgdGVybWluYXRlQXBwTGFtYmRhID0gIG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1Rlcm1pbmF0ZUFwcExhbWJkYScsIHtcbiAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzcsXG4gICAgICAgICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDE1KSxcbiAgICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmlubGluZShzdG9wQXBwbGljYXRpb25sYW1iZGFTb3VyY2UpLFxuICAgICAgICAgICAgaGFuZGxlcjogJ2luZGV4LmVtcHR5X2J1Y2tldCcsXG4gICAgICAgICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uX25hbWU6IHByb3BzLmFwcE5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGVybWluYXRlQXBwTGFtYmRhLmFkZFRvUm9sZVBvbGljeShcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ2tpbmVzaXNhbmFseXRpY3M6U3RvcEFwcGxpY2F0aW9uJ10sXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbYGFybjoke2Nkay5Bd3MuUEFSVElUSU9OfTpraW5lc2lzYW5hbHl0aWNzOiR7Y2RrLkF3cy5SRUdJT059OiR7Y2RrLkF3cy5BQ0NPVU5UX0lEfTphcHBsaWNhdGlvbi8ke3Byb3BzLmFwcE5hbWV9YF1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgbmV3IGxvZ3MuTWV0cmljRmlsdGVyKHRoaXMsICdBcHBUZXJtaW5hdGVkRmlsdGVyJywge1xuICAgICAgICAgICAgZmlsdGVyUGF0dGVybjogbG9ncy5GaWx0ZXJQYXR0ZXJuLmxpdGVyYWwoJ0pvYiByZWFjaGVkIGdsb2JhbGx5IHRlcm1pbmFsIHN0YXRlIEZJTklTSEVEJyksXG4gICAgICAgICAgICBtZXRyaWNOYW1lc3BhY2U6ICdCZWFtJyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdCZWFtQXBwbGljYXRpb25GaW5pc2hlZCcsXG4gICAgICAgICAgICBtZXRyaWNWYWx1ZTogJzEnLFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxuICAgICAgICAgICAgbG9nR3JvdXA6IGxvZ3MuTG9nR3JvdXAuZnJvbUxvZ0dyb3VwTmFtZSh0aGlzLCAnS2RhTG9nR3JvdXAnLCBwcm9wcy5hcHBOYW1lKVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBtZXRyaWMgPSBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQmVhbScsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnQmVhbUFwcGxpY2F0aW9uRmluaXNoZWQnLFxuICAgICAgICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcygxKVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBhbGFybSA9IG1ldHJpYy5jcmVhdGVBbGFybSh0aGlzLCAnQXBwVGVybWluYXRlZEFsYXJtJywge1xuICAgICAgICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgICAgICAgYWN0aW9uc0VuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6IENvbXBhcmlzb25PcGVyYXRvci5HUkVBVEVSX1RIQU5fVEhSRVNIT0xELFxuICAgICAgICAgICAgdHJlYXRNaXNzaW5nRGF0YTogVHJlYXRNaXNzaW5nRGF0YS5OT1RfQlJFQUNISU5HLFxuICAgICAgICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDEsXG4gICAgICAgICAgICBzdGF0aXN0aWM6IFwic3VtXCJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdG9waWMgPSBuZXcgc25zLlRvcGljKHRoaXMsICdBcHBUZXJtaW5hdGVkVG9waWMnKTtcblxuICAgICAgICB0b3BpYy5hZGRTdWJzY3JpcHRpb24obmV3IHN1YnMuTGFtYmRhU3Vic2NyaXB0aW9uKHRlcm1pbmF0ZUFwcExhbWJkYSkpO1xuXG4vLyAgICAgICAgYWxhcm0uYWRkQWxhcm1BY3Rpb24obmV3IGNsb3Vkd2F0Y2hfYWN0aW9ucy5TbnNBY3Rpb24odG9waWMpKTtcblxuICAgIH1cbn1cbiJdfQ==