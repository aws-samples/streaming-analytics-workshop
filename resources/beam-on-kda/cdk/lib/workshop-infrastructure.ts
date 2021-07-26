import fs = require("fs");
import cdk = require("@aws-cdk/core");
import s3 = require("@aws-cdk/aws-s3");
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require("@aws-cdk/aws-iam");
import sns = require("@aws-cdk/aws-sns");
import emr = require('@aws-cdk/aws-emr');
import lambda = require("@aws-cdk/aws-lambda");
import cfn = require('@aws-cdk/aws-cloudformation')
import subs = require("@aws-cdk/aws-sns-subscriptions");
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import { Duration, RemovalPolicy } from "@aws-cdk/core";
import { EmptyBucketOnDelete } from "./empty-bucket";
import { GithubBuildPipeline } from "./github-build-pipeline";
import { Cloud9DevEnvironment } from "./cloud9-dev-environment";

export interface WorkshopInfrastructureProps extends cdk.StackProps {
  kinesisReplayVersion: string;
  beamApplicationVersion: string;
  beamApplicationJarFile: string;
  appName: string;
}

export class WorkshopInfrastructure extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: WorkshopInfrastructureProps
  ) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "HistoricTrips", {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const emptyBucket = new EmptyBucketOnDelete(this, "EmptyBucket", {
      bucket: bucket,
    });


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
    sg.addIngressRule(sg, ec2.Port.allTraffic());

    const cloud9DevEnvironment = new Cloud9DevEnvironment(this, 'Cloud9DevEnvironment', {
      vpc: vpc,
      bucket: bucket,
      repositoryUrl: `https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer.git`
    });

    // make sure that the bucket is emptied only after the instance sending data has been terminated
    // devEnvironment.autoscaling.addDependsOn(emptyBucket.customResource);

    new GithubBuildPipeline(this, "BeamConsumerBuildPipeline", {
      url: `https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/archive/${props.beamApplicationVersion}.zip`,
      bucket: bucket,
      extract: true,
    });


    const addTimestamplambdaSource = fs
      .readFileSync("lambda/add-approximate-arrival-time.js")
      .toString();

    const enrichEvents = new lambda.Function(this, "EnrichEventsLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.inline(addTimestamplambdaSource),
      timeout: Duration.seconds(60),
      handler: "index.handler",
    });


    const stopApplicationlambdaSource = fs
      .readFileSync("lambda/stop-kda-app.py")
      .toString();

    const terminateAppLambda = new lambda.Function(this, "TerminateAppLambda", {
      runtime: lambda.Runtime.PYTHON_3_7,
      timeout: Duration.minutes(15),
      code: lambda.Code.inline(stopApplicationlambdaSource),
      handler: "index.empty_bucket",
      memorySize: 512,
      environment: {
        application_name: props.appName,
      },
    });

    terminateAppLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["kinesisanalytics:StopApplication"],
        resources: [
          `arn:${cdk.Aws.PARTITION}:kinesisanalytics:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:application/${props.appName}`,
        ],
      })
    );

    const topic = new sns.Topic(this, "ApplicationTerminatedTopic");

    topic.addSubscription(new subs.LambdaSubscription(terminateAppLambda));


    const kdaRole = new iam.Role(this, "KdaRole", {
      assumedBy: new iam.ServicePrincipal("kinesisanalytics.amazonaws.com"),
    });

    kdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "cloudwatch:PutMetricData",
          "logs:Describe*",
          "logs:PutLogEvents",
          "kinesis:List*",
          "kinesis:Describe*",
          "kinesis:Get*",
          "kinesis:SubscribeToShard",
        ],
        resources: ["*"],
      })
    );

    bucket.grantRead(kdaRole);

    s3.Bucket.fromBucketName(this, 'PublicDatasetBucket', 'nyc-tlc').grantRead(kdaRole);


    const emrSg = new ec2.SecurityGroup(this, 'EmrSecurityGroup', {
      vpc: vpc
    });

    emrSg.addIngressRule(sg, ec2.Port.allTraffic());

    const emrClusterRole = new iam.Role(this, 'EmrClusterRole', {
      assumedBy: new iam.ServicePrincipal('elasticmapreduce.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonElasticMapReduceRole')
      ]
    });

    const emrInstanceRole = new iam.Role(this, 'EmrInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonElasticMapReduceforEC2Role'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
      ]
    });

    const emrProfile = new iam.CfnInstanceProfile(this, 'EmrInstanceProfile', {
      roles: [
        emrInstanceRole.roleName
      ]
    });

    const cluster = new emr.CfnCluster(this, 'EmrCluster', {
      name: 'beam-workshop',
      applications: [
        { name: 'Hadoop' },
        { name: 'Ganglia' },
        { name: 'Flink' },
        { name: 'ZooKeeper' }
      ],
      instances: {
        emrManagedMasterSecurityGroup: emrSg.securityGroupId,
        emrManagedSlaveSecurityGroup: emrSg.securityGroupId,
        masterInstanceGroup: {
          instanceCount: 1,
          instanceType: 'c5n.xlarge',
          name: 'Master'
        },
        coreInstanceGroup: {
          instanceCount: 2,
          instanceType: 'r5.xlarge',
          name: 'Core'
        },
        ec2SubnetId: vpc.publicSubnets[0].subnetId
      },
      serviceRole: emrClusterRole.roleName,
      releaseLabel: 'emr-5.27.0',
      visibleToAllUsers: true,
      jobFlowRole: emrProfile.ref,
    });

    const getEmrInstanceIdSource = fs
      .readFileSync("lambda/get-emr-master-id.py")
      .toString();

    const getEmrInstanceId = new lambda.Function(this, "GetEmrInstanceIdLambda", {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.inline(getEmrInstanceIdSource),
      timeout: Duration.seconds(30),
      handler: "index.get_instance_id",
    });

    getEmrInstanceId.addToRolePolicy(new iam.PolicyStatement({
      actions: ['elasticmapreduce:ListInstances'],
      resources: [`arn:${cdk.Aws.PARTITION}:elasticmapreduce:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:cluster/${cluster.ref}`]
    }));

    const customResource = new cfn.CustomResource(this, 'GetEmrInstanceIdResource', {
      provider: cfn.CustomResourceProvider.fromLambda(getEmrInstanceId),
      properties: {
        EmrId: cluster.ref
      }
    });


    const metric = (dimensions?: cloudwatch.DimensionHash) => new cloudwatch.Metric({
      metricName: 'Number of Trips',
      namespace: 'Beam',
      dimensions: {
        ...dimensions,
        StreamName: 'beam-workshop',
      },
      statistic: 'max',
      period: Duration.seconds(1)
    });

    const dashboard = new cloudwatch.Dashboard(this, 'BeamWorkshopDashboard', {
      start: '-PT30M'
    });

    dashboard.addWidgets(new cloudwatch.GraphWidget({
      title: 'Number of trips (total)',
      left: [metric()],
      width: 24
    }));

    dashboard.addWidgets(new cloudwatch.GraphWidget({
      title: 'Number of trips (per borough)',
      left: [
        metric({ Borough: 'Bronx' }),
        metric({ Borough: 'Brooklyn' }),
        metric({ Borough: 'EWR' }),
        metric({ Borough: 'Queens' }),
        metric({ Borough: 'Staten Island' }),
        metric({ Borough: 'Manhattan' }),
      ],
      width: 24,
      stacked: true
    }));

    new cdk.CfnOutput(this, "ConnectToEmrCluster", { value: `https://console.aws.amazon.com/systems-manager/session-manager/${customResource.getAtt('EmrMasterInstanceId')}` });
    new cdk.CfnOutput(this, "DownloadJarFile", { value: `aws s3 cp --recursive --exclude '*' --include '${props.beamApplicationJarFile}' 's3://${bucket.bucketName}/target/' .` })
    new cdk.CfnOutput(this, 'StartBeamApplication', { value: `flink run -p 8 ${props.beamApplicationJarFile} --runner=FlinkRunner --awsRegion=${cdk.Aws.REGION} --source=s3 --inputS3Pattern=s3://${bucket.bucketName}/historic-trip-events/*/*/*/*/* --inputStreamName=beam-workshop --outputBoroughs=true` });
  }
}
