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
  eventEngine: boolean;
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
      beamSourceRepositoryUrl: `https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer.git`,
      kinesisReplayVersion: props.kinesisReplayVersion,
      eventEngine: props.eventEngine
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
      code: lambda.Code.fromInline(addTimestamplambdaSource),
      timeout: Duration.seconds(60),
      handler: "index.handler",
    });


    const stopApplicationlambdaSource = fs
      .readFileSync("lambda/stop-kda-app.py")
      .toString();

    const terminateAppLambda = new lambda.Function(this, "TerminateAppLambda", {
      runtime: lambda.Runtime.PYTHON_3_7,
      timeout: Duration.minutes(15),
      code: lambda.Code.fromInline(stopApplicationlambdaSource),
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
      width: 24,
      liveData: true
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
      stacked: true,
      liveData: true
    }));

    dashboard.addWidgets(new cloudwatch.LogQueryWidget({
      title: `Flink error log: /aws/kinesis-analytics/${props.appName}`,
      logGroupNames: [ `/aws/kinesis-analytics/${props.appName}`],
      queryString: 'fields @timestamp, @message\n| filter isPresent(throwableInformation) or @message like /Error/\n| | filter not(logger like /org.apache.commons.beanutils/)\n|sort @timestamp desc',
      width: 24
    }));

    new cdk.CfnOutput(this, "InputS3Pattern", { value: `s3://${bucket.bucketName}/historic-trip-events/*/*/*/*/*` });
  }
}