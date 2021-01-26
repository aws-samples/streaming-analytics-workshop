import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import codebuild = require('@aws-cdk/aws-codebuild');
import { SecretValue, CfnParameter, RemovalPolicy } from '@aws-cdk/core';
import { BuildSpec } from '@aws-cdk/aws-codebuild';
import { Bucket } from '@aws-cdk/aws-s3';

export class BuildWorkshopResources extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


        const oauthTokenSecret = new CfnParameter(this, 'GithubOauthTokenSecret', {
            type: 'String',
            default: 'arn:aws:secretsmanager:eu-west-1:399220903411:secret:github-A6LLW8'
        });

        const outputBucketArn = new CfnParameter(this, 'OutputBucketArn', {
            type: 'String',
            default: 'arn:aws:s3:::shausma-public'
        });

        const outputPrefix = new CfnParameter(this, 'OutputPrefix', {
            type: 'String',
            default: 'public/cfn-templates/streaming-analytics-workshop'
        });

        const oauthToken = SecretValue.secretsManager(oauthTokenSecret.valueAsString, {
            jsonField: 'api-key'
        })


        const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
            versioned: true,
            removalPolicy: RemovalPolicy.DESTROY
        });

        const outputBucket = Bucket.fromBucketAttributes(this, 'OutputBucket', {
            bucketArn: outputBucketArn.valueAsString
        });


        const sourceOutput = new codepipeline.Artifact();

        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName: 'SourceAction',
            branch: 'mainline',
            owner: 'aws-samples',
            repo: 'streaming-analytics-workshop',
            output: sourceOutput,
            oauthToken: oauthToken
          });


        let cdkBuildProject = (path:string) => new codebuild.PipelineProject(this, `CdkCodebuildProject-${path}`, {
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
            },
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        'runtime-versions': {
                            nodejs: 14
                        }
                    },
                    pre_build: {
                        commands: [
                            'npm install -g aws-cdk'
                        ]
                    },
                    build: {
                        commands: [
                            `cd ${path}`,
                            'npm install',
                            'cdk synthesize',
                        ]
                    }
                },
                artifacts: {
                  files: [
                    '*.template.json'
                  ],
                  'base-directory': `${path}/cdk.out`,
                  'discard-paths': true,
                }
            })
        });


        const flinkBuildOutput = new codepipeline.Artifact('flinkCfnTemplate');
        const beamBuildOutput = new codepipeline.Artifact('beamCfnTemplate');

        const flinkBuildAction = new codepipeline_actions.CodeBuildAction({
            actionName: 'flinkCdkBuildAction',
            project: cdkBuildProject('resources/flink-on-kda/cdk'),
            input: sourceOutput,
            outputs: [flinkBuildOutput]
        });

        const beamBuildAction = new codepipeline_actions.CodeBuildAction({
            actionName: 'beamCdkBuildAction',
            project: cdkBuildProject('resources/beam-on-kda/cdk'),
            input: sourceOutput,
            outputs: [beamBuildOutput]
        });

        let cdkCopyAction = (output:codepipeline.Artifact) => new codepipeline_actions.S3DeployAction({
            actionName: `CdkCopyAction-${output.artifactName}`,
            bucket: outputBucket,
            input: beamBuildOutput,
            objectKey: outputPrefix.valueAsString,
            extract: true
        });


        new codepipeline.Pipeline(this, 'CodePipeline', {
            stages: [
              {
                stageName: 'Source',
                actions: [ sourceAction ]
              },
              {
                stageName: 'Build',
                actions: [ flinkBuildAction, beamBuildAction ]
              },
              {
                stageName: 'Copy',
                actions: [ cdkCopyAction(flinkBuildOutput), cdkCopyAction(beamBuildOutput) ]
              }
            ],
            artifactBucket: artifactBucket
          });
      
    }
}