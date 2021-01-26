import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import cfn = require('@aws-cdk/aws-cloudformation');
import autoscaling = require('@aws-cdk/aws-autoscaling');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import secretsmanager = require('@aws-cdk/aws-secretsmanager');
import elasticsearch = require('@aws-cdk/aws-elasticsearch');
import { GithubBuildPipeline } from './github-build-pipeline';
import { RemovalPolicy, Duration, Stack } from '@aws-cdk/core';
import { BuildSpec } from '@aws-cdk/aws-codebuild';
import { EmptyBucketOnDelete } from './empty-bucket';

export interface WorkshopInfrastructureProps extends cdk.StackProps {
  kinesisReplayVersion: String,
  consumerApplicationVersion: String,
  consumerApplicationJarObject: String
}

export class WorkshopInfrastructure extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: WorkshopInfrastructureProps) {
    super(scope, id, props);


    const bucket = new s3.Bucket(this, 'Bucket', {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    new EmptyBucketOnDelete(this, 'EmptyBucket', {
      bucket: bucket
    });


    new GithubBuildPipeline(this, 'KinesisReplayBuildPipeline', {
      url: `https://github.com/aws-samples/amazon-kinesis-replay/archive/${props.kinesisReplayVersion}.zip`,
      bucket: bucket,
      extract: true
    });

    new GithubBuildPipeline(this, 'ConsumerApplicationBuildPipeline', {
      url: `https://github.com/aws-samples/amazon-kinesis-analytics-taxi-consumer/archive/${props.consumerApplicationVersion}.zip`,
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

    const es = new elasticsearch.CfnDomain(this, 'ElasticsearchDomain', {
      elasticsearchClusterConfig: {
        instanceCount: 1,
        instanceType: 't2.medium.elasticsearch'
      },
      ebsOptions: {
        ebsEnabled: true,
        volumeSize: 10,
        volumeType: 'gp2'
      },
      elasticsearchVersion: "7.1",
      accessPolicies: {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "AWS": "*"
            },
            "Action": [
              "es:ESHttp*"
            ],
            "Resource": "*",
            "Condition": {
              "IpAddress": {
                "aws:SourceIp": [
                  eip.ref
                ]
              }
            }
          }
        ]
      }
    });


    const policy = new iam.PolicyDocument();

    policy.addStatements(new iam.PolicyStatement({
      actions: [
        'secretsmanager:GetSecretValue',
      ],
      resources: [ localAdminPassword.secretArn ]
    }));

    policy.addStatements(new iam.PolicyStatement({
      actions: [
        'ec2:AssociateAddress',
        'cloudwatch:PutMetricData',
        'logs:Describe*', 'logs:PutLogEvents',
        'kinesis:DescribeStream', 'kinesis:ListShards', 'kinesis:GetShardIterator', 'kinesis:GetRecords', 'kinesis:PutRecord', 'kinesis:PutRecords',
        'kinesisanalytics:StartApplication'
      ],
      resources: [ '*' ]
    }));

    policy.addStatements(new iam.PolicyStatement({
      actions: [
        'cloudformation:DescribeStacks'
      ],
      resources: [ cdk.Aws.STACK_ID ]
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
      timeout: Duration.minutes(20).toSeconds().toString()
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
        userData: cdk.Fn.base64(
          `<powershell>            
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
              choco install intellijidea-community --no-progress --version 2019.2.4 -y
            } Until ($LASTEXITCODE -eq 0)

            # Add IntelliJ Java 11 to the path
            $PATH = [Environment]::GetEnvironmentVariable("PATH", "Machine")
            $intellij_path = "C:\\Program Files\\JetBrains\\IntelliJ IDEA Community Edition 2019.2.4\\jbr\\bin"
            [Environment]::SetEnvironmentVariable("PATH", "$PATH;$intellij_path", "Machine")

            $desktop = "C:\\Users\\Administrator\\Desktop"

            # Create desktop shortcuts
            Remove-Item -path "$desktop\\*.website"
            Copy-Item "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\JetBrains\\*.lnk" "$desktop"

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

            $url = "https://raw.githubusercontent.com/aws-samples/amazon-kinesis-analytics-taxi-consumer/${props.consumerApplicationVersion}/misc/streaming-analytics-workshop-dashboard.json"
            $file = "$desktop\\workshop-resources\\streaming-analytics-workshop-dashboard.json"
            (New-Object System.Net.WebClient).DownloadFile($url, $file)

            # Wait until build pipelines have successfully build all artifacts
            Wait-CFNStack -StackName "${cdk.Aws.STACK_NAME}" -Timeout 900

            Copy-S3Object -BucketName "${bucket.bucketName}" -KeyPrefix target -LocalFolder "$desktop\\workshop-resources"
          </powershell>`.split('\n').map(line => line.trimLeft()).join('\n')
        )
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
            {instanceType: 'm5.2xlarge'},
            {instanceType: 'c5.2xlarge'},
            {instanceType: 'm3.2xlarge'},
            {instanceType: 'm5.xlarge'},
            {instanceType: 'c5.xlarge'},
            {instanceType: 'm4.xlarge'},
            {instanceType: 'c4.xlarge'}
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
      resources: [ '*' ]
    }));

    kdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [ 'es:ESHttp*' ],
      resources: [ `${es.attrArn}/*` ]
    }));

    bucket.grantRead(kdaRole);


    new cdk.CfnOutput(this, 'InstanceIp', { value: eip.ref });
    new cdk.CfnOutput(this, 'InstanceLoginCredentials', { value: `https://console.aws.amazon.com/secretsmanager/#/secret?name=${localAdminPassword.secretArn}` });    
    new cdk.CfnOutput(this, 'ElasticsearchDomainName', { value: es.attrDomainEndpoint });
    new cdk.CfnOutput(this, 'KinesisAnalyticsServiceRole', { value: kdaRole.roleName });
    new cdk.CfnOutput(this, 'FlinkApplicationJarBucket', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'FlinkApplicationJarObject', { value: `target/${props.consumerApplicationJarObject}` });
  }
}