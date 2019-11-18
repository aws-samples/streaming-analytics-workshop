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
            branch: 'master',
            owner: 'aws-samples',
            repo: 'streaming-analytics-workshop',
            output: sourceOutput,
            oauthToken: oauthToken
          });

        
        const hugoBuildProject = new codebuild.PipelineProject(this, 'HugoCodebuildProject', {
            environment: {
                buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
                environmentVariables: {
                    VERSION_HUGO: {
                        value: '0.59.1'
                    }
                }
            },
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {
                        commands: [
                            'wget https://github.com/gohugoio/hugo/releases/download/v${VERSION_HUGO}/hugo_${VERSION_HUGO}_Linux-64bit.tar.gz',
                            'tar -xvf hugo_${VERSION_HUGO}_Linux-64bit.tar.gz hugo',
                            'mv -v hugo /usr/bin/hugo',
                            'chmod +x /usr/bin/hugo',
                            'rm -rvf hugo_${VERSION_HUGO}_Linux-64bit.tar.gz',
                            'find .'
                        ]
                    },
                    build: {
                        commands: [
                            'git submodule init && git submodule update',
                            'echo "<p class="build-number">${AWS_COMMIT_ID}</p>" >> layouts/partials/menu-footer.html',
                            'hugo -v',
                            'find .'
                        ]
                    }
                },
                artifacts: {
                  files: [
                    `**/*`
                  ],
                  'base-directory': 'public',
                  'discard-paths': true,
                }
            })
        });

        const hugoBuildOutput = new codepipeline.Artifact();

        const hugoBuildAction = new codepipeline_actions.CodeBuildAction({
            actionName: 'HugoBuildAction',
            project: hugoBuildProject,
            input: sourceOutput,
            outputs: [hugoBuildOutput]
        });
      

        const cdkBuildProject = new codebuild.PipelineProject(this, 'CdkCodebuildProject', {
            environment: {
                buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
            },
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {
                        commands: [
                            'npm install -g aws-cdk'
                        ]
                    },
                    build: {
                        commands: [
                            'cd cdk',
                            'npm install',
                            'cdk synthesize',
                        ]
                    }
                },
                artifacts: {
                  files: [
                    'StreamingAnalyticsWorkshop*.template.json'
                  ],
                  'base-directory': 'cdk/cdk.out',
                  'discard-paths': true,
                }
            })
        });

        const cdkBuildOutput = new codepipeline.Artifact();

        const cdkBuildAction = new codepipeline_actions.CodeBuildAction({
            actionName: 'CdkBuildAction',
            project: cdkBuildProject,
            input: sourceOutput,
            outputs: [cdkBuildOutput]
        });
  

        const hugoCopyAction = new codepipeline_actions.S3DeployAction({
            actionName: 'HugoCopyAction',
            bucket: artifactBucket,
            input: hugoBuildOutput,
            extract: true
        });

        const cdkCopyAction = new codepipeline_actions.S3DeployAction({
            actionName: 'CdkCopyAction',
            bucket: outputBucket,
            input: cdkBuildOutput,
            objectKey: outputPrefix.valueAsString,
            extract: true
        });


        new codepipeline.Pipeline(this, 'CodePipeline', {
            stages: [
              {
                stageName: 'Source',
                actions: [sourceAction]
              },
              {
                stageName: 'Build',
                actions: [/*hugoBuildAction,*/ cdkBuildAction]
              },
              {
                stageName: 'Copy',
                actions: [/*hugoCopyAction,*/ cdkCopyAction]
              }
            ],
            artifactBucket: artifactBucket
          });
      
    }
}