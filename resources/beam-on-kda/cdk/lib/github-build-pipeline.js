"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cdk = require("@aws-cdk/core");
const cfn = require("@aws-cdk/aws-cloudformation");
const lambda = require("@aws-cdk/aws-lambda");
const codepipeline = require("@aws-cdk/aws-codepipeline");
const codepipeline_actions = require("@aws-cdk/aws-codepipeline-actions");
const codebuild = require("@aws-cdk/aws-codebuild");
const aws_codebuild_1 = require("@aws-cdk/aws-codebuild");
const core_1 = require("@aws-cdk/core");
const aws_cloudformation_1 = require("@aws-cdk/aws-cloudformation");
class GithubBuildPipeline extends cdk.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const match = props.url.match(/https:\/\/github.com\/[^\/]+\/([^\/]+)\/archive\/([^\/]+)\.zip/);
        if (!match) {
            throw Error(`Expecting valid GitHub archive url, found: ${props.url}`);
        }
        const artifact = match[1];
        const directory = match.slice(1).join('-');
        const key = `sources/${directory}.zip`;
        const lambdaSource = fs.readFileSync('lambda/build-pipeline-helper.py').toString();
        const downloadLambda = new lambda.Function(this, 'DownloadLambda', {
            runtime: lambda.Runtime.PYTHON_3_7,
            timeout: core_1.Duration.seconds(30),
            code: lambda.Code.inline(lambdaSource),
            handler: 'index.download_sources',
            environment: {
                url: props.url,
                bucket: props.bucket.bucketName,
                key: key
            }
        });
        props.bucket.grantPut(downloadLambda);
        new cfn.CustomResource(this, 'DownloadLambdaResource', {
            provider: aws_cloudformation_1.CustomResourceProvider.lambda(downloadLambda)
        });
        const sourceOutput = new codepipeline.Artifact();
        const sourceAction = new codepipeline_actions.S3SourceAction({
            actionName: 'SourceAction',
            bucket: props.bucket,
            bucketKey: key,
            output: sourceOutput
        });
        const defaultBuildspec = aws_codebuild_1.BuildSpec.fromObject({
            version: '0.2',
            phases: {
                build: {
                    commands: [
                        `cd ${directory}`,
                        'mvn clean package -B'
                    ]
                }
            },
            artifacts: {
                files: [
                    `target/${artifact}-*.jar`
                ],
                'discard-paths': false,
                'base-directory': directory
            }
        });
        const project = new codebuild.PipelineProject(this, 'CodebuildProject', {
            environment: {
                buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_OPEN_JDK_11
            },
            buildSpec: props.buildspec ? props.buildspec : defaultBuildspec
        });
        const buildOutput = new codepipeline.Artifact();
        const buildAction = new codepipeline_actions.CodeBuildAction({
            actionName: 'BuildAction',
            project,
            input: sourceOutput,
            extraInputs: props.sourceAction ? props.sourceAction.actionProperties.outputs : undefined,
            outputs: [buildOutput]
        });
        const copyAction = new codepipeline_actions.S3DeployAction({
            actionName: 'CopyAction',
            bucket: props.bucket,
            input: buildOutput,
            extract: props.extract,
            objectKey: props.objectKey
        });
        const waitHandle = new cfn.CfnWaitConditionHandle(this, 'WaitHandle');
        this.buildSuccessWaitCondition = new cfn.CfnWaitCondition(this, 'WaitCondition', {
            count: 1,
            handle: waitHandle.ref,
            timeout: core_1.Duration.minutes(20).toSeconds().toString()
        });
        const notifyLambda = new lambda.Function(this, 'NotifyLambda', {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.inline(lambdaSource),
            timeout: core_1.Duration.seconds(10),
            handler: 'index.notify_build_success',
            environment: {
                waitHandleUrl: waitHandle.ref,
            }
        });
        const notifyAction = new codepipeline_actions.LambdaInvokeAction({
            actionName: 'InvokeAction',
            lambda: notifyLambda,
            runOrder: 2
        });
        new codepipeline.Pipeline(this, 'CodePipeline', {
            stages: [
                {
                    stageName: 'Source',
                    actions: props.sourceAction ? [sourceAction, props.sourceAction] : [sourceAction]
                },
                {
                    stageName: 'Build',
                    actions: [buildAction]
                },
                {
                    stageName: 'Copy',
                    actions: [copyAction, notifyAction]
                }
            ],
            artifactBucket: props.bucket
        });
        //const cfnId = artifact.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
        // new cdk.CfnOutput(this, `${cfnId}CopyCommand`, { value: `aws s3 cp --recursive --exclude '*' --include '${artifact}-*.jar' 's3://${props.bucket.bucketName}/target/' .` });
    }
}
exports.GithubBuildPipeline = GithubBuildPipeline;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLWJ1aWxkLXBpcGVsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2l0aHViLWJ1aWxkLXBpcGVsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUJBQTBCO0FBQzFCLHFDQUFzQztBQUV0QyxtREFBb0Q7QUFDcEQsOENBQStDO0FBQy9DLDBEQUEyRDtBQUMzRCwwRUFBMkU7QUFDM0Usb0RBQXFEO0FBQ3JELDBEQUFtRDtBQUNuRCx3Q0FBeUM7QUFDekMsb0VBQXFFO0FBWXJFLE1BQWEsbUJBQW9CLFNBQVEsR0FBRyxDQUFDLFNBQVM7SUFHcEQsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUErQjtRQUMzRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7UUFFaEcsSUFBSSxDQUFFLEtBQUssRUFBRTtZQUNYLE1BQU0sS0FBSyxDQUFDLDhDQUE4QyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUN4RTtRQUVELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxNQUFNLEdBQUcsR0FBRyxXQUFXLFNBQVMsTUFBTSxDQUFDO1FBRXZDLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVuRixNQUFNLGNBQWMsR0FBSSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ2xFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7WUFDbEMsT0FBTyxFQUFFLGVBQVEs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WUFDRCxjQUFjLEVBQUUsS0FBSyxDQUFDLE1BQU07U0FDN0IsQ0FBQyxDQUFDO1FBR0gsOEZBQThGO1FBRTlGLDhLQUE4SztJQUNoTCxDQUFDO0NBQ0Y7QUE3SUQsa0RBNklDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgczMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtczMnKTtcbmltcG9ydCBjZm4gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2xvdWRmb3JtYXRpb24nKTtcbmltcG9ydCBsYW1iZGEgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtbGFtYmRhJyk7XG5pbXBvcnQgY29kZXBpcGVsaW5lID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZScpO1xuaW1wb3J0IGNvZGVwaXBlbGluZV9hY3Rpb25zID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZS1hY3Rpb25zJyk7XG5pbXBvcnQgY29kZWJ1aWxkID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVidWlsZCcpO1xuaW1wb3J0IHsgQnVpbGRTcGVjIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVidWlsZCc7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgQ3VzdG9tUmVzb3VyY2VQcm92aWRlciB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jbG91ZGZvcm1hdGlvbic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQnVpbGRQaXBlbGluZVByb3BzIHtcbiAgdXJsOiBzdHJpbmcsXG4gIGJ1Y2tldDogczMuQnVja2V0LFxuICBleHRyYWN0OiBib29sZWFuLFxuICBvYmplY3RLZXk/OiBzdHJpbmcsXG4gIGJ1aWxkc3BlYz86IGNvZGVidWlsZC5CdWlsZFNwZWMsXG4gIHNvdXJjZUFjdGlvbj86IGNvZGVwaXBlbGluZV9hY3Rpb25zLlMzU291cmNlQWN0aW9uXG59XG5cblxuZXhwb3J0IGNsYXNzIEdpdGh1YkJ1aWxkUGlwZWxpbmUgZXh0ZW5kcyBjZGsuQ29uc3RydWN0IHtcbiAgYnVpbGRTdWNjZXNzV2FpdENvbmRpdGlvbjogY2ZuLkNmbldhaXRDb25kaXRpb247XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBHaXRodWJCdWlsZFBpcGVsaW5lUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgbWF0Y2ggPSBwcm9wcy51cmwubWF0Y2goL2h0dHBzOlxcL1xcL2dpdGh1Yi5jb21cXC9bXlxcL10rXFwvKFteXFwvXSspXFwvYXJjaGl2ZVxcLyhbXlxcL10rKVxcLnppcC8pO1xuXG4gICAgaWYgKCEgbWF0Y2gpIHtcbiAgICAgIHRocm93IEVycm9yKGBFeHBlY3RpbmcgdmFsaWQgR2l0SHViIGFyY2hpdmUgdXJsLCBmb3VuZDogJHtwcm9wcy51cmx9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXJ0aWZhY3QgPSBtYXRjaFsxXTtcbiAgICBjb25zdCBkaXJlY3RvcnkgPSBtYXRjaC5zbGljZSgxKS5qb2luKCctJyk7XG4gICAgY29uc3Qga2V5ID0gYHNvdXJjZXMvJHtkaXJlY3Rvcnl9LnppcGA7XG5cbiAgICBjb25zdCBsYW1iZGFTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoJ2xhbWJkYS9idWlsZC1waXBlbGluZS1oZWxwZXIucHknKS50b1N0cmluZygpO1xuXG4gICAgY29uc3QgZG93bmxvYWRMYW1iZGEgPSAgbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRG93bmxvYWRMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM183LFxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5pbmxpbmUobGFtYmRhU291cmNlKSxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5kb3dubG9hZF9zb3VyY2VzJyxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIHVybDogcHJvcHMudXJsLFxuICAgICAgICBidWNrZXQ6IHByb3BzLmJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgICBrZXk6IGtleVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcHJvcHMuYnVja2V0LmdyYW50UHV0KGRvd25sb2FkTGFtYmRhKTtcblxuICAgIG5ldyBjZm4uQ3VzdG9tUmVzb3VyY2UodGhpcywgJ0Rvd25sb2FkTGFtYmRhUmVzb3VyY2UnLCB7XG4gICAgICBwcm92aWRlcjogQ3VzdG9tUmVzb3VyY2VQcm92aWRlci5sYW1iZGEoZG93bmxvYWRMYW1iZGEpXG4gICAgfSk7XG5cblxuICAgIGNvbnN0IHNvdXJjZU91dHB1dCA9IG5ldyBjb2RlcGlwZWxpbmUuQXJ0aWZhY3QoKTtcblxuICAgIGNvbnN0IHNvdXJjZUFjdGlvbiA9IG5ldyBjb2RlcGlwZWxpbmVfYWN0aW9ucy5TM1NvdXJjZUFjdGlvbih7XG4gICAgICBhY3Rpb25OYW1lOiAnU291cmNlQWN0aW9uJyxcbiAgICAgIGJ1Y2tldDogcHJvcHMuYnVja2V0LFxuICAgICAgYnVja2V0S2V5OiBrZXksXG4gICAgICBvdXRwdXQ6IHNvdXJjZU91dHB1dFxuICAgIH0pO1xuXG5cbiAgICBjb25zdCBkZWZhdWx0QnVpbGRzcGVjID0gQnVpbGRTcGVjLmZyb21PYmplY3Qoe1xuICAgICAgdmVyc2lvbjogJzAuMicsXG4gICAgICBwaGFzZXM6IHtcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICBjb21tYW5kczogW1xuICAgICAgICAgICAgYGNkICR7ZGlyZWN0b3J5fWAsXG4gICAgICAgICAgICAnbXZuIGNsZWFuIHBhY2thZ2UgLUInXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXJ0aWZhY3RzOiB7XG4gICAgICAgIGZpbGVzOiBbXG4gICAgICAgICAgYHRhcmdldC8ke2FydGlmYWN0fS0qLmphcmBcbiAgICAgICAgXSxcbiAgICAgICAgJ2Rpc2NhcmQtcGF0aHMnOiBmYWxzZSxcbiAgICAgICAgJ2Jhc2UtZGlyZWN0b3J5JzogZGlyZWN0b3J5XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IGNvZGVidWlsZC5QaXBlbGluZVByb2plY3QodGhpcywgJ0NvZGVidWlsZFByb2plY3QnLCB7XG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBidWlsZEltYWdlOiBjb2RlYnVpbGQuTGludXhCdWlsZEltYWdlLlVCVU5UVV8xNF8wNF9PUEVOX0pES18xMVxuICAgICAgfSxcbiAgICAgIGJ1aWxkU3BlYzogcHJvcHMuYnVpbGRzcGVjID8gcHJvcHMuYnVpbGRzcGVjIDogZGVmYXVsdEJ1aWxkc3BlY1xuICAgIH0pO1xuXG5cbiAgICBjb25zdCBidWlsZE91dHB1dCA9IG5ldyBjb2RlcGlwZWxpbmUuQXJ0aWZhY3QoKTtcblxuICAgIGNvbnN0IGJ1aWxkQWN0aW9uID0gbmV3IGNvZGVwaXBlbGluZV9hY3Rpb25zLkNvZGVCdWlsZEFjdGlvbih7XG4gICAgICBhY3Rpb25OYW1lOiAnQnVpbGRBY3Rpb24nLFxuICAgICAgcHJvamVjdCxcbiAgICAgIGlucHV0OiBzb3VyY2VPdXRwdXQsXG4gICAgICBleHRyYUlucHV0czogcHJvcHMuc291cmNlQWN0aW9uID8gcHJvcHMuc291cmNlQWN0aW9uLmFjdGlvblByb3BlcnRpZXMub3V0cHV0cyA6IHVuZGVmaW5lZCxcbiAgICAgIG91dHB1dHM6IFtidWlsZE91dHB1dF1cbiAgICB9KTtcblxuICAgIGNvbnN0IGNvcHlBY3Rpb24gPSBuZXcgY29kZXBpcGVsaW5lX2FjdGlvbnMuUzNEZXBsb3lBY3Rpb24oe1xuICAgICAgYWN0aW9uTmFtZTogJ0NvcHlBY3Rpb24nLFxuICAgICAgYnVja2V0OiBwcm9wcy5idWNrZXQsXG4gICAgICBpbnB1dDogYnVpbGRPdXRwdXQsXG4gICAgICBleHRyYWN0OiBwcm9wcy5leHRyYWN0LFxuICAgICAgb2JqZWN0S2V5OiBwcm9wcy5vYmplY3RLZXlcbiAgICB9KTtcbiAgICBcbiAgICBjb25zdCB3YWl0SGFuZGxlID0gbmV3IGNmbi5DZm5XYWl0Q29uZGl0aW9uSGFuZGxlKHRoaXMsICdXYWl0SGFuZGxlJyk7XG5cbiAgICB0aGlzLmJ1aWxkU3VjY2Vzc1dhaXRDb25kaXRpb24gPSBuZXcgY2ZuLkNmbldhaXRDb25kaXRpb24odGhpcywgJ1dhaXRDb25kaXRpb24nLCB7XG4gICAgICBjb3VudDogMSxcbiAgICAgIGhhbmRsZTogd2FpdEhhbmRsZS5yZWYsXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDIwKS50b1NlY29uZHMoKS50b1N0cmluZygpXG4gICAgfSk7XG5cblxuICAgIGNvbnN0IG5vdGlmeUxhbWJkYSA9ICBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdOb3RpZnlMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM183LFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuaW5saW5lKGxhbWJkYVNvdXJjZSksXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDEwKSxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5ub3RpZnlfYnVpbGRfc3VjY2VzcycsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICB3YWl0SGFuZGxlVXJsOiB3YWl0SGFuZGxlLnJlZixcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IG5vdGlmeUFjdGlvbiA9IG5ldyBjb2RlcGlwZWxpbmVfYWN0aW9ucy5MYW1iZGFJbnZva2VBY3Rpb24oe1xuICAgICAgYWN0aW9uTmFtZTogJ0ludm9rZUFjdGlvbicsXG4gICAgICBsYW1iZGE6IG5vdGlmeUxhbWJkYSxcbiAgICAgIHJ1bk9yZGVyOiAyXG4gICAgfSk7XG5cblxuICAgIG5ldyBjb2RlcGlwZWxpbmUuUGlwZWxpbmUodGhpcywgJ0NvZGVQaXBlbGluZScsIHtcbiAgICAgIHN0YWdlczogW1xuICAgICAgICB7XG4gICAgICAgICAgc3RhZ2VOYW1lOiAnU291cmNlJyxcbiAgICAgICAgICBhY3Rpb25zOiBwcm9wcy5zb3VyY2VBY3Rpb24gPyBbc291cmNlQWN0aW9uLCBwcm9wcy5zb3VyY2VBY3Rpb25dIDogW3NvdXJjZUFjdGlvbl1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHN0YWdlTmFtZTogJ0J1aWxkJyxcbiAgICAgICAgICBhY3Rpb25zOiBbYnVpbGRBY3Rpb25dXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzdGFnZU5hbWU6ICdDb3B5JyxcbiAgICAgICAgICBhY3Rpb25zOiBbY29weUFjdGlvbiwgbm90aWZ5QWN0aW9uXVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgYXJ0aWZhY3RCdWNrZXQ6IHByb3BzLmJ1Y2tldFxuICAgIH0pO1xuXG5cbiAgICAvL2NvbnN0IGNmbklkID0gYXJ0aWZhY3Quc3BsaXQoJy0nKS5tYXAocyA9PiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKSkuam9pbignJyk7XG5cbiAgICAvLyBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBgJHtjZm5JZH1Db3B5Q29tbWFuZGAsIHsgdmFsdWU6IGBhd3MgczMgY3AgLS1yZWN1cnNpdmUgLS1leGNsdWRlICcqJyAtLWluY2x1ZGUgJyR7YXJ0aWZhY3R9LSouamFyJyAnczM6Ly8ke3Byb3BzLmJ1Y2tldC5idWNrZXROYW1lfS90YXJnZXQvJyAuYCB9KTtcbiAgfVxufSJdfQ==