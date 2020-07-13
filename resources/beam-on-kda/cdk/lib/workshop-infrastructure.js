"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const ec2 = require("@aws-cdk/aws-ec2");
const iam = require("@aws-cdk/aws-iam");
const cfn = require("@aws-cdk/aws-cloudformation");
const autoscaling = require("@aws-cdk/aws-autoscaling");
const secretsmanager = require("@aws-cdk/aws-secretsmanager");
const github_build_pipeline_1 = require("./github-build-pipeline");
const core_1 = require("@aws-cdk/core");
const empty_bucket_1 = require("./empty-bucket");
const workshop_resources_1 = require("../lib/workshop-resources");
class WorkshopInfrastructure extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        new workshop_resources_1.WorkshopResources(this, 'WorkshopResources', {
            appName: 'beam-workshop'
        });
        const bucket = new s3.Bucket(this, 'Bucket', {
            versioned: true,
            removalPolicy: core_1.RemovalPolicy.DESTROY
        });
        new empty_bucket_1.EmptyBucketOnDelete(this, 'EmptyBucket', {
            bucket: bucket
        });
        new github_build_pipeline_1.GithubBuildPipeline(this, 'KinesisReplayBuildPipeline', {
            url: `https://github.com/aws-samples/amazon-kinesis-replay/archive/${props.kinesisReplayVersion}.zip`,
            bucket: bucket,
            extract: true
        });
        const localAdminPassword = new secretsmanager.Secret(this, 'TemplatedSecret', {
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'Administrator' }),
                generateStringKey: 'password',
                passwordLength: 16,
                excludePunctuation: true,
                includeSpace: false
            }
        });
        const policy = new iam.PolicyDocument();
        policy.addStatements(new iam.PolicyStatement({
            actions: [
                'secretsmanager:GetSecretValue',
            ],
            resources: [localAdminPassword.secretArn]
        }));
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
                bucket.bucketArn,
                `${bucket.bucketArn}/*`,
                `arn:${cdk.Aws.PARTITION}:s3:::aws-bigdata-blog`,
                `arn:${cdk.Aws.PARTITION}:s3:::aws-bigdata-blog/*`,
            ]
        }));
        const eip = new ec2.CfnEIP(this, 'InstanceEip');
        const vpc = new ec2.Vpc(this, 'Vpc', {
            subnetConfiguration: [{
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC
                }]
        });
        const sg = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc: vpc
        });
        sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3389));
        const ami = new ec2.WindowsImage(ec2.WindowsVersion.WINDOWS_SERVER_2019_ENGLISH_FULL_BASE);
        const instanceRole = new iam.Role(this, 'InstanceRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
            ],
            inlinePolicies: {
                WorkshopPermissions: policy
            }
        });
        const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
            roles: [
                instanceRole.roleName
            ]
        });
        const waitHandle = new cfn.CfnWaitConditionHandle(this, 'InstanceWaitHandle');
        const waitCondition = new cfn.CfnWaitCondition(this, 'InstanceBootstrapWaitCondition', {
            count: 1,
            handle: waitHandle.ref,
            timeout: core_1.Duration.minutes(20).toSeconds().toString()
        });
        const launchTemplate = new ec2.CfnLaunchTemplate(this, 'LaunchTemplate', {
            launchTemplateData: {
                imageId: ami.getImage(this).imageId,
                iamInstanceProfile: {
                    arn: instanceProfile.attrArn
                },
                networkInterfaces: [{
                        associatePublicIpAddress: true,
                        deleteOnTermination: true,
                        deviceIndex: 0,
                        groups: [sg.securityGroupId]
                    }],
                userData: cdk.Fn.base64(`<powershell>            
            Import-Module AWSPowerShell

            # Install choco
            iex ((New-Object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))

            # Add gitter and retry to install commands
            $iter = 0
            $sleep = 5

            Do {
              Start-Sleep -Seconds (Get-Random -Maximum ($sleep*[Math]::Pow(2,$iter++)))
              choco install git --no-progress -y
            } Until ($LASTEXITCODE -eq 0)

            Do {
              Start-Sleep -Seconds (Get-Random -Maximum ($sleep*[Math]::Pow(2,$iter++)))
              choco install firefox --no-progress -y
            } Until ($LASTEXITCODE -eq 0)

            Do {
              Start-Sleep -Seconds (Get-Random -Maximum ($sleep*[Math]::Pow(2,$iter++)))
              choco install intellijidea-community --no-progress --version 2020.1.2 -y
            } Until ($LASTEXITCODE -eq 0)

            # Add IntelliJ Java 11 to the path
            $PATH = [Environment]::GetEnvironmentVariable("PATH", "Machine")
            $intellij_path = "C:\\Program Files\\JetBrains\\IntelliJ IDEA Community Edition 2020.1.2\\jbr\\bin"
            [Environment]::SetEnvironmentVariable("PATH", "$PATH;$intellij_path", "Machine")

            $desktop = "C:\\Users\\Administrator\\Desktop"

            # Create desktop shortcuts
            Remove-Item -path "$desktop\\*.website"

            # Change password
            $password = ((Get-SECSecretValue -SecretId '${localAdminPassword.secretArn}').SecretString | ConvertFrom-Json).Password
            net.exe user Administrator "$password"

            # Associate EIP
            $instanceId = Invoke-RestMethod -uri http://169.254.169.254/latest/meta-data/instance-id
            Register-EC2Address -InstanceId "$instanceId" -AllocationId "${eip.attrAllocationId}"

            # Signal success to CFN
            cfn-signal.exe --success true --region "${cdk.Aws.REGION}" "${waitHandle.ref}"


            # Download artifacts
            New-Item -Path "$desktop" -Name "workshop-resources" -ItemType "directory"

            # Wait until build pipelines have successfully build all artifacts
            Wait-CFNStack -StackName "${cdk.Aws.STACK_NAME}" -Timeout 1800

            Copy-S3Object -BucketName "${bucket.bucketName}" -KeyPrefix target -LocalFolder "$desktop\\workshop-resources"
          </powershell>`.split('\n').map(line => line.trimLeft()).join('\n'))
            }
        });
        waitCondition.addDependsOn(launchTemplate);
        new autoscaling.CfnAutoScalingGroup(this, 'AutoScalingGroup', {
            mixedInstancesPolicy: {
                launchTemplate: {
                    launchTemplateSpecification: {
                        launchTemplateId: launchTemplate.ref,
                        version: launchTemplate.attrDefaultVersionNumber
                    },
                    overrides: [
                        { instanceType: 'm5.2xlarge' },
                        { instanceType: 'c5.2xlarge' },
                        { instanceType: 'm3.2xlarge' },
                        { instanceType: 'm5.xlarge' },
                        { instanceType: 'c5.xlarge' },
                        { instanceType: 'm4.xlarge' },
                        { instanceType: 'c4.xlarge' }
                    ]
                },
                instancesDistribution: {
                    onDemandBaseCapacity: 1
                }
            },
            maxSize: '1',
            minSize: '1',
            desiredCapacity: '1',
            vpcZoneIdentifier: vpc.publicSubnets.map(subnet => subnet.subnetId)
        });
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
        new cdk.CfnOutput(this, 'InstanceIp', { value: eip.ref });
        new cdk.CfnOutput(this, 'InstanceLoginCredentials', { value: `https://console.aws.amazon.com/secretsmanager/#/secret?name=${localAdminPassword.secretArn}` });
        new cdk.CfnOutput(this, 'KinesisAnalyticsServiceRole', { value: kdaRole.roleName });
        // new cdk.CfnOutput(this, 'FlinkApplicationJarBucket', { value: bucket.bucketName });
        // new cdk.CfnOutput(this, 'FlinkApplicationJarObject', { value: `target/${props.consumerApplicationJarObject}` });
    }
}
exports.WorkshopInfrastructure = WorkshopInfrastructure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3Nob3AtaW5mcmFzdHJ1Y3R1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3b3Jrc2hvcC1pbmZyYXN0cnVjdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUFzQztBQUN0QyxzQ0FBdUM7QUFDdkMsd0NBQXlDO0FBQ3pDLHdDQUF5QztBQUN6QyxtREFBb0Q7QUFDcEQsd0RBQXlEO0FBRXpELDhEQUErRDtBQUMvRCxtRUFBOEQ7QUFDOUQsd0NBQStEO0FBQy9ELGlEQUFxRDtBQUVyRCxrRUFBOEQ7QUFXOUQsTUFBYSxzQkFBdUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNuRCxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQWtDO1FBQzlFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLElBQUksc0NBQWlCLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQy9DLE9BQU8sRUFBRSxlQUFlO1NBQ3pCLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQzNDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsYUFBYSxFQUFFLG9CQUFhLENBQUMsT0FBTztTQUNyQyxDQUFDLENBQUM7UUFFSCxJQUFJLGtDQUFtQixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDM0MsTUFBTSxFQUFFLE1BQU07U0FDZixDQUFDLENBQUM7UUFHSCxJQUFJLDJDQUFtQixDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUMxRCxHQUFHLEVBQUUsZ0VBQWdFLEtBQUssQ0FBQyxvQkFBb0IsTUFBTTtZQUNyRyxNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFDO1FBR0gsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGlCQUFp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IjpbImltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuaW1wb3J0IHMzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXMzJyk7XG5pbXBvcnQgZWMyID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWVjMicpO1xuaW1wb3J0IGlhbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1pYW0nKTtcbmltcG9ydCBjZm4gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2xvdWRmb3JtYXRpb24nKTtcbmltcG9ydCBhdXRvc2NhbGluZyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1hdXRvc2NhbGluZycpO1xuaW1wb3J0IGxhbWJkYSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1sYW1iZGEnKTtcbmltcG9ydCBzZWNyZXRzbWFuYWdlciA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zZWNyZXRzbWFuYWdlcicpO1xuaW1wb3J0IHsgR2l0aHViQnVpbGRQaXBlbGluZSB9IGZyb20gJy4vZ2l0aHViLWJ1aWxkLXBpcGVsaW5lJztcbmltcG9ydCB7IFJlbW92YWxQb2xpY3ksIER1cmF0aW9uLCBTdGFjayB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgRW1wdHlCdWNrZXRPbkRlbGV0ZSB9IGZyb20gJy4vZW1wdHktYnVja2V0JztcblxuaW1wb3J0IHsgV29ya3Nob3BSZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvd29ya3Nob3AtcmVzb3VyY2VzJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtzaG9wSW5mcmFzdHJ1Y3R1cmVQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAga2luZXNpc1JlcGxheVZlcnNpb246IFN0cmluZyxcbiAgY29uc3VtZXJBcHBsaWNhdGlvblZlcnNpb246IFN0cmluZyxcbiAgY29uc3VtZXJBcHBsaWNhdGlvbkphck9iamVjdDogU3RyaW5nLFxuICBmbGlua1ZlcnNpb246IFN0cmluZyxcbiAgZmxpbmtTY2FsYVZlcnNpb246IFN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgV29ya3Nob3BJbmZyYXN0cnVjdHVyZSBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogV29ya3Nob3BJbmZyYXN0cnVjdHVyZVByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBuZXcgV29ya3Nob3BSZXNvdXJjZXModGhpcywgJ1dvcmtzaG9wUmVzb3VyY2VzJywge1xuICAgICAgYXBwTmFtZTogJ2JlYW0td29ya3Nob3AnXG4gICAgfSk7XG5cbiAgICBjb25zdCBidWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdCdWNrZXQnLCB7XG4gICAgICB2ZXJzaW9uZWQ6IHRydWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1lcbiAgICB9KTtcblxuICAgIG5ldyBFbXB0eUJ1Y2tldE9uRGVsZXRlKHRoaXMsICdFbXB0eUJ1Y2tldCcsIHtcbiAgICAgIGJ1Y2tldDogYnVja2V0XG4gICAgfSk7XG5cblxuICAgIG5ldyBHaXRodWJCdWlsZFBpcGVsaW5lKHRoaXMsICdLaW5lc2lzUmVwbGF5QnVpbGRQaXBlbGluZScsIHtcbiAgICAgIHVybDogYGh0dHBzOi8vZ2l0aHViLmNvbS9hd3Mtc2FtcGxlcy9hbWF6b24ta2luZXNpcy1yZXBsYXkvYXJjaGl2ZS8ke3Byb3BzLmtpbmVzaXNSZXBsYXlWZXJzaW9ufS56aXBgLFxuICAgICAgYnVja2V0OiBidWNrZXQsXG4gICAgICBleHRyYWN0OiB0cnVlXG4gICAgfSk7XG5cblxuICAgIGNvbnN0IGxvY2FsQWRtaW5QYXNzd29yZCA9IG5ldyBzZWNyZXRzbWFuYWdlci5TZWNyZXQodGhpcywgJ1RlbXBsYXRlZFNlY3JldCcsIHtcbiAgICAgIGdlbmVyYXRlU2VjcmV0U3RyaW5nOiB7XG4gICAgICAgIHNlY3JldFN0cmluZ1RlbXBsYXRlOiBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lOiAnQWRtaW5pc3RyYXRvcicgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiAncGFzc3dvcmQnLFxuICAgICAgICBwYXNzd29yZExlbmd0aDogMTYsXG4gICAgICAgIGV4Y2x1ZGVQdW5jdHVhdGlvbjogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZVNwYWNlOiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgXG5cbiAgICBjb25zdCBwb2xpY3kgPSBuZXcgaWFtLlBvbGljeURvY3VtZW50KCk7XG5cbiAgICBwb2xpY3kuYWRkU3RhdGVtZW50cyhuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdzZWNyZXRzbWFuYWdlcjpHZXRTZWNyZXRWYWx1ZScsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbIGxvY2FsQWRtaW5QYXNzd29yZC5zZWNyZXRBcm4gXVxuICAgIH0pKTtcblxuICAgIHBvbGljeS5hZGRTdGF0ZW1lbnRzKG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2VjMjpBc3NvY2lhdGVBZGRyZXNzJyxcbiAgICAgICAgJ2Nsb3Vkd2F0Y2g6UHV0TWV0cmljRGF0YScsXG4gICAgICAgICdsb2dzOkRlc2NyaWJlKicsICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICdraW5lc2lzOkRlc2NyaWJlU3RyZWFtJywgJ2tpbmVzaXM6TGlzdFNoYXJkcycsICdraW5lc2lzOkdldFNoYXJkSXRlcmF0b3InLCAna2luZXNpczpHZXRSZWNvcmRzJywgJ2tpbmVzaXM6UHV0UmVjb3JkJywgJ2tpbmVzaXM6UHV0UmVjb3JkcycsXG4gICAgICAgICdraW5lc2lzYW5hbHl0aWNzOlN0YXJ0QXBwbGljYXRpb24nXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbICcqJyBdXG4gICAgfSkpO1xuXG4gICAgcG9saWN5LmFkZFN0YXRlbWVudHMobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnY2xvdWRmb3JtYXRpb246RGVzY3JpYmVTdGFja3MnXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbIGNkay5Bd3MuU1RBQ0tfSUQgXVxuICAgIH0pKTtcblxuICAgIHBvbGljeS5hZGRTdGF0ZW1lbnRzKG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ3MzOkdldE9iamVjdConLCAnczM6R2V0QnVja2V0KicsICdzMzpMaXN0KidcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgYnVja2V0LmJ1Y2tldEFybixcbiAgICAgICAgYCR7YnVja2V0LmJ1Y2tldEFybn0vKmAsXG4gICAgICAgIGBhcm46JHtjZGsuQXdzLlBBUlRJVElPTn06czM6Ojphd3MtYmlnZGF0YS1ibG9nYCxcbiAgICAgICAgYGFybjoke2Nkay5Bd3MuUEFSVElUSU9OfTpzMzo6OmF3cy1iaWdkYXRhLWJsb2cvKmAsXG4gICAgICBdXG4gICAgfSkpO1xuXG5cbiAgICBjb25zdCBlaXAgPSBuZXcgZWMyLkNmbkVJUCh0aGlzLCAnSW5zdGFuY2VFaXAnKTtcblxuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsICdWcGMnLCB7XG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbeyAgXG4gICAgICAgIG5hbWU6ICdwdWJsaWMnLFxuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUNcbiAgICAgIH1dXG4gICAgfSk7XG5cbiAgICBjb25zdCBzZyA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgIHZwYzogdnBjXG4gICAgfSk7XG5cbiAgICBzZy5hZGRJbmdyZXNzUnVsZShlYzIuUGVlci5hbnlJcHY0KCksIGVjMi5Qb3J0LnRjcCgzMzg5KSk7XG5cbiAgICBjb25zdCBhbWkgPSBuZXcgZWMyLldpbmRvd3NJbWFnZShlYzIuV2luZG93c1ZlcnNpb24uV0lORE9XU19TRVJWRVJfMjAxOV9FTkdMSVNIX0ZVTExfQkFTRSk7XG5cbiAgICBjb25zdCBpbnN0YW5jZVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0luc3RhbmNlUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlYzIuYW1hem9uYXdzLmNvbScpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uU1NNTWFuYWdlZEluc3RhbmNlQ29yZScpXG4gICAgICBdLFxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcbiAgICAgICAgV29ya3Nob3BQZXJtaXNzaW9uczogcG9saWN5XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBpbnN0YW5jZVByb2ZpbGUgPSBuZXcgaWFtLkNmbkluc3RhbmNlUHJvZmlsZSh0aGlzLCAnSW5zdGFuY2VQcm9maWxlJywge1xuICAgICAgcm9sZXM6IFtcbiAgICAgICAgaW5zdGFuY2VSb2xlLnJvbGVOYW1lXG4gICAgICBdXG4gICAgfSk7XG5cbiAgICBjb25zdCB3YWl0SGFuZGxlID0gbmV3IGNmbi5DZm5XYWl0Q29uZGl0aW9uSGFuZGxlKHRoaXMsICdJbnN0YW5jZVdhaXRIYW5kbGUnKTtcblxuICAgIGNvbnN0IHdhaXRDb25kaXRpb24gPSBuZXcgY2ZuLkNmbldhaXRDb25kaXRpb24odGhpcywgJ0luc3RhbmNlQm9vdHN0cmFwV2FpdENvbmRpdGlvbicsIHtcbiAgICAgIGNvdW50OiAxLFxuICAgICAgaGFuZGxlOiB3YWl0SGFuZGxlLnJlZixcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoMjApLnRvU2Vjb25kcygpLnRvU3RyaW5nKClcbiAgICB9KTtcblxuICAgIGNvbnN0IGxhdW5jaFRlbXBsYXRlID0gbmV3IGVjMi5DZm5MYXVuY2hUZW1wbGF0ZSh0aGlzLCAnTGF1bmNoVGVtcGxhdGUnLCB7XG4gICAgICBsYXVuY2hUZW1wbGF0ZURhdGE6IHtcbiAgICAgICAgaW1hZ2VJZDogYW1pLmdldEltYWdlKHRoaXMpLmltYWdlSWQsXG4gICAgICAgIGlhbUluc3RhbmNlUHJvZmlsZToge1xuICAgICAgICAgIGFybjogaW5zdGFuY2VQcm9maWxlLmF0dHJBcm5cbiAgICAgICAgfSxcbiAgICAgICAgbmV0d29ya0ludGVyZmFjZXM6IFt7XG4gICAgICAgICAgYXNzb2NpYXRlUHVibGljSXBBZGRyZXNzOiB0cnVlLFxuICAgICAgICAgIGRlbGV0ZU9uVGVybWluYXRpb246IHRydWUsXG4gICAgICAgICAgZGV2aWNlSW5kZXg6IDAsXG4gICAgICAgICAgZ3JvdXBzOiBbc2cuc2VjdXJpdHlHcm91cElkXVxuICAgICAgICB9XSxcbiAgICAgICAgdXNlckRhdGE6IGNkay5Gbi5iYXNlNjQoXG4gICAgICAgICAgYDxwb3dlcnNoZWxsPiAgICAgICAgICAgIFxuICAgICAgICAgICAgSW1wb3J0LU1vZHVsZSBBV1NQb3dlclNoZWxsXG5cbiAgICAgICAgICAgICMgSW5zdGFsbCBjaG9jb1xuICAgICAgICAgICAgaWV4ICgoTmV3LU9iamVjdCBuZXQud2ViY2xpZW50KS5Eb3dubG9hZFN0cmluZygnaHR0cHM6Ly9jaG9jb2xhdGV5Lm9yZy9pbnN0YWxsLnBzMScpKVxuXG4gICAgICAgICAgICAjIEFkZCBnaXR0ZXIgYW5kIHJldHJ5IHRvIGluc3RhbGwgY29tbWFuZHNcbiAgICAgICAgICAgICRpdGVyID0gMFxuICAgICAgICAgICAgJHNsZWVwID0gNVxuXG4gICAgICAgICAgICBEbyB7XG4gICAgICAgICAgICAgIFN0YXJ0LVNsZWVwIC1TZWNvbmRzIChHZXQtUmFuZG9tIC1NYXhpbXVtICgkc2xlZXAqW01hdGhdOjpQb3coMiwkaXRlcisrKSkpXG4gICAgICAgICAgICAgIGNob2NvIGluc3RhbGwgZ2l0IC0tbm8tcHJvZ3Jlc3MgLXlcbiAgICAgICAgICAgIH0gVW50aWwgKCRMQVNURVhJVENPREUgLWVxIDApXG5cbiAgICAgICAgICAgIERvIHtcbiAgICAgICAgICAgICAgU3RhcnQtU2xlZXAgLVNlY29uZHMgKEdldC1SYW5kb20gLU1heGltdW0gKCRzbGVlcCpbTWF0aF06OlBvdygyLCRpdGVyKyspKSlcbiAgICAgICAgICAgICAgY2hvY28gaW5zdGFsbCBmaXJlZm94IC0tbm8tcHJvZ3Jlc3MgLXlcbiAgICAgICAgICAgIH0gVW50aWwgKCRMQVNURVhJVENPREUgLWVxIDApXG5cbiAgICAgICAgICAgIERvIHtcbiAgICAgICAgICAgICAgU3RhcnQtU2xlZXAgLVNlY29uZHMgKEdldC1SYW5kb20gLU1heGltdW0gKCRzbGVlcCpbTWF0aF06OlBvdygyLCRpdGVyKyspKSlcbiAgICAgICAgICAgICAgY2hvY28gaW5zdGFsbCBpbnRlbGxpamlkZWEtY29tbXVuaXR5IC0tbm8tcHJvZ3Jlc3MgLS12ZXJzaW9uIDIwMjAuMS4yIC15XG4gICAgICAgICAgICB9IFVudGlsICgkTEFTVEVYSVRDT0RFIC1lcSAwKVxuXG4gICAgICAgICAgICAjIEFkZCBJbnRlbGxpSiBKYXZhIDExIHRvIHRoZSBwYXRoXG4gICAgICAgICAgICAkUEFUSCA9IFtFbnZpcm9ubWVudF06OkdldEVudmlyb25tZW50VmFyaWFibGUoXCJQQVRIXCIsIFwiTWFjaGluZVwiKVxuICAgICAgICAgICAgJGludGVsbGlqX3BhdGggPSBcIkM6XFxcXFByb2dyYW0gRmlsZXNcXFxcSmV0QnJhaW5zXFxcXEludGVsbGlKIElERUEgQ29tbXVuaXR5IEVkaXRpb24gMjAyMC4xLjJcXFxcamJyXFxcXGJpblwiXG4gICAgICAgICAgICBbRW52aXJvbm1lbnRdOjpTZXRFbnZpcm9ubWVudFZhcmlhYmxlKFwiUEFUSFwiLCBcIiRQQVRIOyRpbnRlbGxpal9wYXRoXCIsIFwiTWFjaGluZVwiKVxuXG4gICAgICAgICAgICAkZGVza3RvcCA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5pc3RyYXRvclxcXFxEZXNrdG9wXCJcblxuICAgICAgICAgICAgIyBDcmVhdGUgZGVza3RvcCBzaG9ydGN1dHNcbiAgICAgICAgICAgIFJlbW92ZS1JdGVtIC1wYXRoIFwiJGRlc2t0b3BcXFxcKi53ZWJzaXRlXCJcblxuICAgICAgICAgICAgIyBDaGFuZ2UgcGFzc3dvcmRcbiAgICAgICAgICAgICRwYXNzd29yZCA9ICgoR2V0LVNFQ1NlY3JldFZhbHVlIC1TZWNyZXRJZCAnJHtsb2NhbEFkbWluUGFzc3dvcmQuc2VjcmV0QXJufScpLlNlY3JldFN0cmluZyB8IENvbnZlcnRGcm9tLUpzb24pLlBhc3N3b3JkXG4gICAgICAgICAgICBuZXQuZXhlIHVzZXIgQWRtaW5pc3RyYXRvciBcIiRwYXNzd29yZFwiXG5cbiAgICAgICAgICAgICMgQXNzb2NpYXRlIEVJUFxuICAgICAgICAgICAgJGluc3RhbmNlSWQgPSBJbnZva2UtUmVzdE1ldGhvZCAtdXJpIGh0dHA6Ly8xNjkuMjU0LjE2OS4yNTQvbGF0ZXN0L21ldGEtZGF0YS9pbnN0YW5jZS1pZFxuICAgICAgICAgICAgUmVnaXN0ZXItRUMyQWRkcmVzcyAtSW5zdGFuY2VJZCBcIiRpbnN0YW5jZUlkXCIgLUFsbG9jYXRpb25JZCBcIiR7ZWlwLmF0dHJBbGxvY2F0aW9uSWR9XCJcblxuICAgICAgICAgICAgIyBTaWduYWwgc3VjY2VzcyB0byBDRk5cbiAgICAgICAgICAgIGNmbi1zaWduYWwuZXhlIC0tc3VjY2VzcyB0cnVlIC0tcmVnaW9uIFwiJHtjZGsuQXdzLlJFR0lPTn1cIiBcIiR7d2FpdEhhbmRsZS5yZWZ9XCJcblxuXG4gICAgICAgICAgICAjIERvd25sb2FkIGFydGlmYWN0c1xuICAgICAgICAgICAgTmV3LUl0ZW0gLVBhdGggXCIkZGVza3RvcFwiIC1OYW1lIFwid29ya3Nob3AtcmVzb3VyY2VzXCIgLUl0ZW1UeXBlIFwiZGlyZWN0b3J5XCJcblxuICAgICAgICAgICAgIyBXYWl0IHVudGlsIGJ1aWxkIHBpcGVsaW5lcyBoYXZlIHN1Y2Nlc3NmdWxseSBidWlsZCBhbGwgYXJ0aWZhY3RzXG4gICAgICAgICAgICBXYWl0LUNGTlN0YWNrIC1TdGFja05hbWUgXCIke2Nkay5Bd3MuU1RBQ0tfTkFNRX1cIiAtVGltZW91dCAxODAwXG5cbiAgICAgICAgICAgIENvcHktUzNPYmplY3QgLUJ1Y2tldE5hbWUgXCIke2J1Y2tldC5idWNrZXROYW1lfVwiIC1LZXlQcmVmaXggdGFyZ2V0IC1Mb2NhbEZvbGRlciBcIiRkZXNrdG9wXFxcXHdvcmtzaG9wLXJlc291cmNlc1wiXG4gICAgICAgICAgPC9wb3dlcnNoZWxsPmAuc3BsaXQoJ1xcbicpLm1hcChsaW5lID0+IGxpbmUudHJpbUxlZnQoKSkuam9pbignXFxuJylcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgd2FpdENvbmRpdGlvbi5hZGREZXBlbmRzT24obGF1bmNoVGVtcGxhdGUpO1xuXG5cbiAgICBuZXcgYXV0b3NjYWxpbmcuQ2ZuQXV0b1NjYWxpbmdHcm91cCh0aGlzLCAnQXV0b1NjYWxpbmdHcm91cCcsIHtcbiAgICAgIG1peGVkSW5zdGFuY2VzUG9saWN5OiB7XG4gICAgICAgIGxhdW5jaFRlbXBsYXRlOiB7XG4gICAgICAgICAgbGF1bmNoVGVtcGxhdGVTcGVjaWZpY2F0aW9uOiB7XG4gICAgICAgICAgICBsYXVuY2hUZW1wbGF0ZUlkOiBsYXVuY2hUZW1wbGF0ZS5yZWYsXG4gICAgICAgICAgICB2ZXJzaW9uOiBsYXVuY2hUZW1wbGF0ZS5hdHRyRGVmYXVsdFZlcnNpb25OdW1iZXJcbiAgICAgICAgICB9LFxuICAgICAgICAgIG92ZXJyaWRlczogW1xuICAgICAgICAgICAge2luc3RhbmNlVHlwZTogJ201LjJ4bGFyZ2UnfSxcbiAgICAgICAgICAgIHtpbnN0YW5jZVR5cGU6ICdjNS4yeGxhcmdlJ30sXG4gICAgICAgICAgICB7aW5zdGFuY2VUeXBlOiAnbTMuMnhsYXJnZSd9LFxuICAgICAgICAgICAge2luc3RhbmNlVHlwZTogJ201LnhsYXJnZSd9LFxuICAgICAgICAgICAge2luc3RhbmNlVHlwZTogJ2M1LnhsYXJnZSd9LFxuICAgICAgICAgICAge2luc3RhbmNlVHlwZTogJ200LnhsYXJnZSd9LFxuICAgICAgICAgICAge2luc3RhbmNlVHlwZTogJ2M0LnhsYXJnZSd9XG4gICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgaW5zdGFuY2VzRGlzdHJpYnV0aW9uOiB7XG4gICAgICAgICAgb25EZW1hbmRCYXNlQ2FwYWNpdHk6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG1heFNpemU6ICcxJyxcbiAgICAgIG1pblNpemU6ICcxJyxcbiAgICAgIGRlc2lyZWRDYXBhY2l0eTogJzEnLFxuICAgICAgdnBjWm9uZUlkZW50aWZpZXI6IHZwYy5wdWJsaWNTdWJuZXRzLm1hcChzdWJuZXQgPT4gc3VibmV0LnN1Ym5ldElkKVxuICAgIH0pO1xuXG5cbiAgICBjb25zdCBrZGFSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdLZGFSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2tpbmVzaXNhbmFseXRpY3MuYW1hem9uYXdzLmNvbScpLFxuXG4gICAgfSk7XG5cbiAgICBrZGFSb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2xvZ3M6RGVzY3JpYmUqJywgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcbiAgICAgICAgJ2tpbmVzaXM6TGlzdConLCAna2luZXNpczpEZXNjcmliZSonLCAna2luZXNpczpHZXQqJywgJ2tpbmVzaXM6U3Vic2NyaWJlVG9TaGFyZCcsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbICcqJyBdXG4gICAgfSkpO1xuXG4gICAgYnVja2V0LmdyYW50UmVhZChrZGFSb2xlKTtcblxuXG5cblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdJbnN0YW5jZUlwJywgeyB2YWx1ZTogZWlwLnJlZiB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSW5zdGFuY2VMb2dpbkNyZWRlbnRpYWxzJywgeyB2YWx1ZTogYGh0dHBzOi8vY29uc29sZS5hd3MuYW1hem9uLmNvbS9zZWNyZXRzbWFuYWdlci8jL3NlY3JldD9uYW1lPSR7bG9jYWxBZG1pblBhc3N3b3JkLnNlY3JldEFybn1gIH0pOyAgICBcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnS2luZXNpc0FuYWx5dGljc1NlcnZpY2VSb2xlJywgeyB2YWx1ZToga2RhUm9sZS5yb2xlTmFtZSB9KTtcbiAgICAvLyBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRmxpbmtBcHBsaWNhdGlvbkphckJ1Y2tldCcsIHsgdmFsdWU6IGJ1Y2tldC5idWNrZXROYW1lIH0pO1xuICAgIC8vIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdGbGlua0FwcGxpY2F0aW9uSmFyT2JqZWN0JywgeyB2YWx1ZTogYHRhcmdldC8ke3Byb3BzLmNvbnN1bWVyQXBwbGljYXRpb25KYXJPYmplY3R9YCB9KTtcbiAgfVxufSJdfQ==