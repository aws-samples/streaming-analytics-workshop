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
class WorkshopInfrastructure extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
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
        const eip = new ec2.CfnEIP(this, 'InstanceEip');
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
            # Remove-Item -path "$desktop\\*.website"
            # Copy-Item "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\JetBrains\\*.lnk" "$desktop"

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

            # $url = "https://raw.githubusercontent.com/aws-samples/amazon-kinesis-analytics-taxi-consumer/.../misc/streaming-analytics-workshop-dashboard.json"
            # $file = "$desktop\\workshop-resources\\streaming-analytics-workshop-dashboard.json"
            # (New-Object System.Net.WebClient).DownloadFile($url, $file)

            # Wait until build pipelines have successfully build all artifacts
            Wait-CFNStack -StackName "${cdk.Aws.STACK_NAME}" -Timeout 1800

            Copy-S3Object -BucketName "${bucket.bucketName}" -KeyPrefix target -LocalFolder "$desktop\\workshop-resources"

            # Expand-Archive "$desktop\\workshop-resources\\flink-connector-kinesis*.zip" "$desktop\\workshop-resources"
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
        new cdk.CfnOutput(this, 'FlinkApplicationJarBucket', { value: bucket.bucketName });
    }
}
exports.WorkshopInfrastructure = WorkshopInfrastructure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3Nob3AtaW5mcmFzdHJ1Y3R1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3b3Jrc2hvcC1pbmZyYXN0cnVjdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFzQztBQUN0QyxzQ0FBdUM7QUFDdkMsd0NBQXlDO0FBQ3pDLHdDQUF5QztBQUN6QyxtREFBb0Q7QUFDcEQsd0RBQXlEO0FBR3pELDhEQUErRDtBQUUvRCxtRUFBOEQ7QUFDOUQsd0NBQStEO0FBRS9ELGlEQUFxRDtBQVlyRCxNQUFhLHNCQUF1QixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ25ELFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBa0M7UUFDOUUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFHeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDM0MsU0FBUyxFQUFFLElBQUk7WUFDZixhQUFhLEVBQUUsb0JBQWEsQ0FBQyxPQUFPO1NBQ3JDLENBQUMsQ0FBQztRQUVILElBQUksa0NBQW1CLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUMzQyxNQUFNLEVBQUUsTUFBTTtTQUNmLENBQUMsQ0FBQztRQUdILElBQUksMkNBQW1CLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQzFELEdBQUcsRUFBRSxnRUFBZ0UsS0FBSyxDQUFDLG9CQUFvQixNQUFNO1lBQ3JHLE1BQU0sRUFBRSxNQUFNO1lBQ2QsT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUM7UUFHSCxNQUFNLGtCQUFrQixHQUFHLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDNUUsb0JBQW9CLEVBQUU7Z0JBQ3BCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLENBQUM7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PSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgczMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtczMnKTtcbmltcG9ydCBlYzIgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtZWMyJyk7XG5pbXBvcnQgaWFtID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWlhbScpO1xuaW1wb3J0IGNmbiA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1jbG91ZGZvcm1hdGlvbicpO1xuaW1wb3J0IGF1dG9zY2FsaW5nID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWF1dG9zY2FsaW5nJyk7XG5pbXBvcnQgY29kZXBpcGVsaW5lID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZScpO1xuaW1wb3J0IGNvZGVwaXBlbGluZV9hY3Rpb25zID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZS1hY3Rpb25zJyk7XG5pbXBvcnQgc2VjcmV0c21hbmFnZXIgPSByZXF1aXJlKCdAYXdzLWNkay9hd3Mtc2VjcmV0c21hbmFnZXInKTtcbmltcG9ydCBlbGFzdGljc2VhcmNoID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWVsYXN0aWNzZWFyY2gnKTtcbmltcG9ydCB7IEdpdGh1YkJ1aWxkUGlwZWxpbmUgfSBmcm9tICcuL2dpdGh1Yi1idWlsZC1waXBlbGluZSc7XG5pbXBvcnQgeyBSZW1vdmFsUG9saWN5LCBEdXJhdGlvbiwgU3RhY2sgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7IEJ1aWxkU3BlYyB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1jb2RlYnVpbGQnO1xuaW1wb3J0IHsgRW1wdHlCdWNrZXRPbkRlbGV0ZSB9IGZyb20gJy4vZW1wdHktYnVja2V0JztcblxuZXhwb3J0IGludGVyZmFjZSBXb3Jrc2hvcEluZnJhc3RydWN0dXJlUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIGtpbmVzaXNSZXBsYXlWZXJzaW9uOiBTdHJpbmcsXG4gIC8qXG4gIGNvbnN1bWVyQXBwbGljYXRpb25WZXJzaW9uOiBTdHJpbmcsXG4gIGNvbnN1bWVyQXBwbGljYXRpb25KYXJPYmplY3Q6IFN0cmluZyxcbiAgZmxpbmtWZXJzaW9uOiBTdHJpbmcsXG4gIGZsaW5rU2NhbGFWZXJzaW9uOiBTdHJpbmdcbiAgKi9cbn1cblxuZXhwb3J0IGNsYXNzIFdvcmtzaG9wSW5mcmFzdHJ1Y3R1cmUgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IFdvcmtzaG9wSW5mcmFzdHJ1Y3R1cmVQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG5cbiAgICBjb25zdCBidWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdCdWNrZXQnLCB7XG4gICAgICB2ZXJzaW9uZWQ6IHRydWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1lcbiAgICB9KTtcblxuICAgIG5ldyBFbXB0eUJ1Y2tldE9uRGVsZXRlKHRoaXMsICdFbXB0eUJ1Y2tldCcsIHtcbiAgICAgIGJ1Y2tldDogYnVja2V0XG4gICAgfSk7XG5cblxuICAgIG5ldyBHaXRodWJCdWlsZFBpcGVsaW5lKHRoaXMsICdLaW5lc2lzUmVwbGF5QnVpbGRQaXBlbGluZScsIHtcbiAgICAgIHVybDogYGh0dHBzOi8vZ2l0aHViLmNvbS9hd3Mtc2FtcGxlcy9hbWF6b24ta2luZXNpcy1yZXBsYXkvYXJjaGl2ZS8ke3Byb3BzLmtpbmVzaXNSZXBsYXlWZXJzaW9ufS56aXBgLFxuICAgICAgYnVja2V0OiBidWNrZXQsXG4gICAgICBleHRyYWN0OiB0cnVlXG4gICAgfSk7XG5cblxuICAgIGNvbnN0IGxvY2FsQWRtaW5QYXNzd29yZCA9IG5ldyBzZWNyZXRzbWFuYWdlci5TZWNyZXQodGhpcywgJ1RlbXBsYXRlZFNlY3JldCcsIHtcbiAgICAgIGdlbmVyYXRlU2VjcmV0U3RyaW5nOiB7XG4gICAgICAgIHNlY3JldFN0cmluZ1RlbXBsYXRlOiBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lOiAnQWRtaW5pc3RyYXRvcicgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiAncGFzc3dvcmQnLFxuICAgICAgICBwYXNzd29yZExlbmd0aDogMTYsXG4gICAgICAgIGV4Y2x1ZGVQdW5jdHVhdGlvbjogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZVNwYWNlOiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgXG4gICAgY29uc3QgZWlwID0gbmV3IGVjMi5DZm5FSVAodGhpcywgJ0luc3RhbmNlRWlwJyk7XG5cblxuICAgIGNvbnN0IHBvbGljeSA9IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoKTtcblxuICAgIHBvbGljeS5hZGRTdGF0ZW1lbnRzKG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ3NlY3JldHNtYW5hZ2VyOkdldFNlY3JldFZhbHVlJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsgbG9jYWxBZG1pblBhc3N3b3JkLnNlY3JldEFybiBdXG4gICAgfSkpO1xuXG4gICAgcG9saWN5LmFkZFN0YXRlbWVudHMobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnZWMyOkFzc29jaWF0ZUFkZHJlc3MnLFxuICAgICAgICAnY2xvdWR3YXRjaDpQdXRNZXRyaWNEYXRhJyxcbiAgICAgICAgJ2xvZ3M6RGVzY3JpYmUqJywgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcbiAgICAgICAgJ2tpbmVzaXM6RGVzY3JpYmVTdHJlYW0nLCAna2luZXNpczpMaXN0U2hhcmRzJywgJ2tpbmVzaXM6R2V0U2hhcmRJdGVyYXRvcicsICdraW5lc2lzOkdldFJlY29yZHMnLCAna2luZXNpczpQdXRSZWNvcmQnLCAna2luZXNpczpQdXRSZWNvcmRzJyxcbiAgICAgICAgJ2tpbmVzaXNhbmFseXRpY3M6U3RhcnRBcHBsaWNhdGlvbidcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsgJyonIF1cbiAgICB9KSk7XG5cbiAgICBwb2xpY3kuYWRkU3RhdGVtZW50cyhuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdjbG91ZGZvcm1hdGlvbjpEZXNjcmliZVN0YWNrcydcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsgY2RrLkF3cy5TVEFDS19JRCBdXG4gICAgfSkpO1xuXG4gICAgcG9saWN5LmFkZFN0YXRlbWVudHMobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnczM6R2V0T2JqZWN0KicsICdzMzpHZXRCdWNrZXQqJywgJ3MzOkxpc3QqJ1xuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW1xuICAgICAgICBidWNrZXQuYnVja2V0QXJuLFxuICAgICAgICBgJHtidWNrZXQuYnVja2V0QXJufS8qYCxcbiAgICAgICAgYGFybjoke2Nkay5Bd3MuUEFSVElUSU9OfTpzMzo6OmF3cy1iaWdkYXRhLWJsb2dgLFxuICAgICAgICBgYXJuOiR7Y2RrLkF3cy5QQVJUSVRJT059OnMzOjo6YXdzLWJpZ2RhdGEtYmxvZy8qYCxcbiAgICAgIF1cbiAgICB9KSk7XG5cblxuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsICdWcGMnLCB7XG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbeyAgXG4gICAgICAgIG5hbWU6ICdwdWJsaWMnLFxuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUNcbiAgICAgIH1dXG4gICAgfSk7XG5cbiAgICBjb25zdCBzZyA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgIHZwYzogdnBjXG4gICAgfSk7XG5cbiAgICBzZy5hZGRJbmdyZXNzUnVsZShlYzIuUGVlci5hbnlJcHY0KCksIGVjMi5Qb3J0LnRjcCgzMzg5KSk7XG5cbiAgICBjb25zdCBhbWkgPSBuZXcgZWMyLldpbmRvd3NJbWFnZShlYzIuV2luZG93c1ZlcnNpb24uV0lORE9XU19TRVJWRVJfMjAxOV9FTkdMSVNIX0ZVTExfQkFTRSk7XG5cbiAgICBjb25zdCBpbnN0YW5jZVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0luc3RhbmNlUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlYzIuYW1hem9uYXdzLmNvbScpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uU1NNTWFuYWdlZEluc3RhbmNlQ29yZScpXG4gICAgICBdLFxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcbiAgICAgICAgV29ya3Nob3BQZXJtaXNzaW9uczogcG9saWN5XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBpbnN0YW5jZVByb2ZpbGUgPSBuZXcgaWFtLkNmbkluc3RhbmNlUHJvZmlsZSh0aGlzLCAnSW5zdGFuY2VQcm9maWxlJywge1xuICAgICAgcm9sZXM6IFtcbiAgICAgICAgaW5zdGFuY2VSb2xlLnJvbGVOYW1lXG4gICAgICBdXG4gICAgfSk7XG5cbiAgICBjb25zdCB3YWl0SGFuZGxlID0gbmV3IGNmbi5DZm5XYWl0Q29uZGl0aW9uSGFuZGxlKHRoaXMsICdJbnN0YW5jZVdhaXRIYW5kbGUnKTtcblxuICAgIGNvbnN0IHdhaXRDb25kaXRpb24gPSBuZXcgY2ZuLkNmbldhaXRDb25kaXRpb24odGhpcywgJ0luc3RhbmNlQm9vdHN0cmFwV2FpdENvbmRpdGlvbicsIHtcbiAgICAgIGNvdW50OiAxLFxuICAgICAgaGFuZGxlOiB3YWl0SGFuZGxlLnJlZixcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoMjApLnRvU2Vjb25kcygpLnRvU3RyaW5nKClcbiAgICB9KTtcblxuICAgIGNvbnN0IGxhdW5jaFRlbXBsYXRlID0gbmV3IGVjMi5DZm5MYXVuY2hUZW1wbGF0ZSh0aGlzLCAnTGF1bmNoVGVtcGxhdGUnLCB7XG4gICAgICBsYXVuY2hUZW1wbGF0ZURhdGE6IHtcbiAgICAgICAgaW1hZ2VJZDogYW1pLmdldEltYWdlKHRoaXMpLmltYWdlSWQsXG4gICAgICAgIGlhbUluc3RhbmNlUHJvZmlsZToge1xuICAgICAgICAgIGFybjogaW5zdGFuY2VQcm9maWxlLmF0dHJBcm5cbiAgICAgICAgfSxcbiAgICAgICAgbmV0d29ya0ludGVyZmFjZXM6IFt7XG4gICAgICAgICAgYXNzb2NpYXRlUHVibGljSXBBZGRyZXNzOiB0cnVlLFxuICAgICAgICAgIGRlbGV0ZU9uVGVybWluYXRpb246IHRydWUsXG4gICAgICAgICAgZGV2aWNlSW5kZXg6IDAsXG4gICAgICAgICAgZ3JvdXBzOiBbc2cuc2VjdXJpdHlHcm91cElkXVxuICAgICAgICB9XSxcbiAgICAgICAgdXNlckRhdGE6IGNkay5Gbi5iYXNlNjQoXG4gICAgICAgICAgYDxwb3dlcnNoZWxsPiAgICAgICAgICAgIFxuICAgICAgICAgICAgSW1wb3J0LU1vZHVsZSBBV1NQb3dlclNoZWxsXG5cbiAgICAgICAgICAgICMgSW5zdGFsbCBjaG9jb1xuICAgICAgICAgICAgaWV4ICgoTmV3LU9iamVjdCBuZXQud2ViY2xpZW50KS5Eb3dubG9hZFN0cmluZygnaHR0cHM6Ly9jaG9jb2xhdGV5Lm9yZy9pbnN0YWxsLnBzMScpKVxuXG4gICAgICAgICAgICAjIEFkZCBnaXR0ZXIgYW5kIHJldHJ5IHRvIGluc3RhbGwgY29tbWFuZHNcbiAgICAgICAgICAgICRpdGVyID0gMFxuICAgICAgICAgICAgJHNsZWVwID0gNVxuXG4gICAgICAgICAgICBEbyB7XG4gICAgICAgICAgICAgIFN0YXJ0LVNsZWVwIC1TZWNvbmRzIChHZXQtUmFuZG9tIC1NYXhpbXVtICgkc2xlZXAqW01hdGhdOjpQb3coMiwkaXRlcisrKSkpXG4gICAgICAgICAgICAgIGNob2NvIGluc3RhbGwgZ2l0IC0tbm8tcHJvZ3Jlc3MgLXlcbiAgICAgICAgICAgIH0gVW50aWwgKCRMQVNURVhJVENPREUgLWVxIDApXG5cbiAgICAgICAgICAgIERvIHtcbiAgICAgICAgICAgICAgU3RhcnQtU2xlZXAgLVNlY29uZHMgKEdldC1SYW5kb20gLU1heGltdW0gKCRzbGVlcCpbTWF0aF06OlBvdygyLCRpdGVyKyspKSlcbiAgICAgICAgICAgICAgY2hvY28gaW5zdGFsbCBmaXJlZm94IC0tbm8tcHJvZ3Jlc3MgLXlcbiAgICAgICAgICAgIH0gVW50aWwgKCRMQVNURVhJVENPREUgLWVxIDApXG5cbiAgICAgICAgICAgIERvIHtcbiAgICAgICAgICAgICAgU3RhcnQtU2xlZXAgLVNlY29uZHMgKEdldC1SYW5kb20gLU1heGltdW0gKCRzbGVlcCpbTWF0aF06OlBvdygyLCRpdGVyKyspKSlcbiAgICAgICAgICAgICAgY2hvY28gaW5zdGFsbCBpbnRlbGxpamlkZWEtY29tbXVuaXR5IC0tbm8tcHJvZ3Jlc3MgLS12ZXJzaW9uIDIwMjAuMS4yIC15XG4gICAgICAgICAgICB9IFVudGlsICgkTEFTVEVYSVRDT0RFIC1lcSAwKVxuXG4gICAgICAgICAgICAjIEFkZCBJbnRlbGxpSiBKYXZhIDExIHRvIHRoZSBwYXRoXG4gICAgICAgICAgICAkUEFUSCA9IFtFbnZpcm9ubWVudF06OkdldEVudmlyb25tZW50VmFyaWFibGUoXCJQQVRIXCIsIFwiTWFjaGluZVwiKVxuICAgICAgICAgICAgJGludGVsbGlqX3BhdGggPSBcIkM6XFxcXFByb2dyYW0gRmlsZXNcXFxcSmV0QnJhaW5zXFxcXEludGVsbGlKIElERUEgQ29tbXVuaXR5IEVkaXRpb24gMjAyMC4xLjJcXFxcamJyXFxcXGJpblwiXG4gICAgICAgICAgICBbRW52aXJvbm1lbnRdOjpTZXRFbnZpcm9ubWVudFZhcmlhYmxlKFwiUEFUSFwiLCBcIiRQQVRIOyRpbnRlbGxpal9wYXRoXCIsIFwiTWFjaGluZVwiKVxuXG4gICAgICAgICAgICAkZGVza3RvcCA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5pc3RyYXRvclxcXFxEZXNrdG9wXCJcblxuICAgICAgICAgICAgIyBDcmVhdGUgZGVza3RvcCBzaG9ydGN1dHNcbiAgICAgICAgICAgICMgUmVtb3ZlLUl0ZW0gLXBhdGggXCIkZGVza3RvcFxcXFwqLndlYnNpdGVcIlxuICAgICAgICAgICAgIyBDb3B5LUl0ZW0gXCJDOlxcXFxQcm9ncmFtRGF0YVxcXFxNaWNyb3NvZnRcXFxcV2luZG93c1xcXFxTdGFydCBNZW51XFxcXFByb2dyYW1zXFxcXEpldEJyYWluc1xcXFwqLmxua1wiIFwiJGRlc2t0b3BcIlxuXG4gICAgICAgICAgICAjIENoYW5nZSBwYXNzd29yZFxuICAgICAgICAgICAgJHBhc3N3b3JkID0gKChHZXQtU0VDU2VjcmV0VmFsdWUgLVNlY3JldElkICcke2xvY2FsQWRtaW5QYXNzd29yZC5zZWNyZXRBcm59JykuU2VjcmV0U3RyaW5nIHwgQ29udmVydEZyb20tSnNvbikuUGFzc3dvcmRcbiAgICAgICAgICAgIG5ldC5leGUgdXNlciBBZG1pbmlzdHJhdG9yIFwiJHBhc3N3b3JkXCJcblxuICAgICAgICAgICAgIyBBc3NvY2lhdGUgRUlQXG4gICAgICAgICAgICAkaW5zdGFuY2VJZCA9IEludm9rZS1SZXN0TWV0aG9kIC11cmkgaHR0cDovLzE2OS4yNTQuMTY5LjI1NC9sYXRlc3QvbWV0YS1kYXRhL2luc3RhbmNlLWlkXG4gICAgICAgICAgICBSZWdpc3Rlci1FQzJBZGRyZXNzIC1JbnN0YW5jZUlkIFwiJGluc3RhbmNlSWRcIiAtQWxsb2NhdGlvbklkIFwiJHtlaXAuYXR0ckFsbG9jYXRpb25JZH1cIlxuXG4gICAgICAgICAgICAjIFNpZ25hbCBzdWNjZXNzIHRvIENGTlxuICAgICAgICAgICAgY2ZuLXNpZ25hbC5leGUgLS1zdWNjZXNzIHRydWUgLS1yZWdpb24gXCIke2Nkay5Bd3MuUkVHSU9OfVwiIFwiJHt3YWl0SGFuZGxlLnJlZn1cIlxuXG5cbiAgICAgICAgICAgICMgRG93bmxvYWQgYXJ0aWZhY3RzXG4gICAgICAgICAgICBOZXctSXRlbSAtUGF0aCBcIiRkZXNrdG9wXCIgLU5hbWUgXCJ3b3Jrc2hvcC1yZXNvdXJjZXNcIiAtSXRlbVR5cGUgXCJkaXJlY3RvcnlcIlxuXG4gICAgICAgICAgICAjICR1cmwgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hd3Mtc2FtcGxlcy9hbWF6b24ta2luZXNpcy1hbmFseXRpY3MtdGF4aS1jb25zdW1lci8uLi4vbWlzYy9zdHJlYW1pbmctYW5hbHl0aWNzLXdvcmtzaG9wLWRhc2hib2FyZC5qc29uXCJcbiAgICAgICAgICAgICMgJGZpbGUgPSBcIiRkZXNrdG9wXFxcXHdvcmtzaG9wLXJlc291cmNlc1xcXFxzdHJlYW1pbmctYW5hbHl0aWNzLXdvcmtzaG9wLWRhc2hib2FyZC5qc29uXCJcbiAgICAgICAgICAgICMgKE5ldy1PYmplY3QgU3lzdGVtLk5ldC5XZWJDbGllbnQpLkRvd25sb2FkRmlsZSgkdXJsLCAkZmlsZSlcblxuICAgICAgICAgICAgIyBXYWl0IHVudGlsIGJ1aWxkIHBpcGVsaW5lcyBoYXZlIHN1Y2Nlc3NmdWxseSBidWlsZCBhbGwgYXJ0aWZhY3RzXG4gICAgICAgICAgICBXYWl0LUNGTlN0YWNrIC1TdGFja05hbWUgXCIke2Nkay5Bd3MuU1RBQ0tfTkFNRX1cIiAtVGltZW91dCAxODAwXG5cbiAgICAgICAgICAgIENvcHktUzNPYmplY3QgLUJ1Y2tldE5hbWUgXCIke2J1Y2tldC5idWNrZXROYW1lfVwiIC1LZXlQcmVmaXggdGFyZ2V0IC1Mb2NhbEZvbGRlciBcIiRkZXNrdG9wXFxcXHdvcmtzaG9wLXJlc291cmNlc1wiXG5cbiAgICAgICAgICAgICMgRXhwYW5kLUFyY2hpdmUgXCIkZGVza3RvcFxcXFx3b3Jrc2hvcC1yZXNvdXJjZXNcXFxcZmxpbmstY29ubmVjdG9yLWtpbmVzaXMqLnppcFwiIFwiJGRlc2t0b3BcXFxcd29ya3Nob3AtcmVzb3VyY2VzXCJcbiAgICAgICAgICA8L3Bvd2Vyc2hlbGw+YC5zcGxpdCgnXFxuJykubWFwKGxpbmUgPT4gbGluZS50cmltTGVmdCgpKS5qb2luKCdcXG4nKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB3YWl0Q29uZGl0aW9uLmFkZERlcGVuZHNPbihsYXVuY2hUZW1wbGF0ZSk7XG5cblxuICAgIG5ldyBhdXRvc2NhbGluZy5DZm5BdXRvU2NhbGluZ0dyb3VwKHRoaXMsICdBdXRvU2NhbGluZ0dyb3VwJywge1xuICAgICAgbWl4ZWRJbnN0YW5jZXNQb2xpY3k6IHtcbiAgICAgICAgbGF1bmNoVGVtcGxhdGU6IHtcbiAgICAgICAgICBsYXVuY2hUZW1wbGF0ZVNwZWNpZmljYXRpb246IHtcbiAgICAgICAgICAgIGxhdW5jaFRlbXBsYXRlSWQ6IGxhdW5jaFRlbXBsYXRlLnJlZixcbiAgICAgICAgICAgIHZlcnNpb246IGxhdW5jaFRlbXBsYXRlLmF0dHJEZWZhdWx0VmVyc2lvbk51bWJlclxuICAgICAgICAgIH0sXG4gICAgICAgICAgb3ZlcnJpZGVzOiBbXG4gICAgICAgICAgICB7aW5zdGFuY2VUeXBlOiAnbTUuMnhsYXJnZSd9LFxuICAgICAgICAgICAge2luc3RhbmNlVHlwZTogJ2M1LjJ4bGFyZ2UnfSxcbiAgICAgICAgICAgIHtpbnN0YW5jZVR5cGU6ICdtMy4yeGxhcmdlJ30sXG4gICAgICAgICAgICB7aW5zdGFuY2VUeXBlOiAnbTUueGxhcmdlJ30sXG4gICAgICAgICAgICB7aW5zdGFuY2VUeXBlOiAnYzUueGxhcmdlJ30sXG4gICAgICAgICAgICB7aW5zdGFuY2VUeXBlOiAnbTQueGxhcmdlJ30sXG4gICAgICAgICAgICB7aW5zdGFuY2VUeXBlOiAnYzQueGxhcmdlJ31cbiAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBpbnN0YW5jZXNEaXN0cmlidXRpb246IHtcbiAgICAgICAgICBvbkRlbWFuZEJhc2VDYXBhY2l0eTogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbWF4U2l6ZTogJzEnLFxuICAgICAgbWluU2l6ZTogJzEnLFxuICAgICAgZGVzaXJlZENhcGFjaXR5OiAnMScsXG4gICAgICB2cGNab25lSWRlbnRpZmllcjogdnBjLnB1YmxpY1N1Ym5ldHMubWFwKHN1Ym5ldCA9PiBzdWJuZXQuc3VibmV0SWQpXG4gICAgfSk7XG5cblxuICAgIGNvbnN0IGtkYVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0tkYVJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgna2luZXNpc2FuYWx5dGljcy5hbWF6b25hd3MuY29tJyksXG5cbiAgICB9KTtcblxuICAgIGtkYVJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnbG9nczpEZXNjcmliZSonLCAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgICAna2luZXNpczpMaXN0KicsICdraW5lc2lzOkRlc2NyaWJlKicsICdraW5lc2lzOkdldConLCAna2luZXNpczpTdWJzY3JpYmVUb1NoYXJkJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsgJyonIF1cbiAgICB9KSk7XG5cbiAgICBidWNrZXQuZ3JhbnRSZWFkKGtkYVJvbGUpO1xuXG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSW5zdGFuY2VJcCcsIHsgdmFsdWU6IGVpcC5yZWYgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0luc3RhbmNlTG9naW5DcmVkZW50aWFscycsIHsgdmFsdWU6IGBodHRwczovL2NvbnNvbGUuYXdzLmFtYXpvbi5jb20vc2VjcmV0c21hbmFnZXIvIy9zZWNyZXQ/bmFtZT0ke2xvY2FsQWRtaW5QYXNzd29yZC5zZWNyZXRBcm59YCB9KTsgICAgXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0tpbmVzaXNBbmFseXRpY3NTZXJ2aWNlUm9sZScsIHsgdmFsdWU6IGtkYVJvbGUucm9sZU5hbWUgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0ZsaW5rQXBwbGljYXRpb25KYXJCdWNrZXQnLCB7IHZhbHVlOiBidWNrZXQuYnVja2V0TmFtZSB9KTtcbiAgfVxufSJdfQ==