# Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## First time setup with local CDK Deployment

To set up local CDK and deploy against an AWS profile of your choice, need to install CDK and install dependencies. Once this is done run cdk deploy, note the cf file is > 50KiB so need to upload to a S3 bucket first. The CDK deploy takes about 10 minutes to run.

- Follow this link to install [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)
- Add your AWS Account and credentials as a profile to `~/.aws/credentials` and `~/.aws/config`

```bash
~/.aws/credentials
[myprofile]
aws_access_key_id = MY_AWS_ACCESSKEY
aws_secret_access_key = MY_AWS_SECRETKEY
aws_session_token = MY_AWS_SESSION_TOKEN

~/.aws/config
[profile myprofile]
output = json
region = eu-west-1
```

Once this is setup run the following to deploy:

```bash
$ cd resources/cdk
$ cdk --version
1.51.0 (build 8c2d53c)

1. Setup npm dependencies
$ npm install
$ npm watch

2. Deploy the CDK stack
$ cdk bootstrap aws://[AWSACCOUNTID]/eu-west-1 --profile myprofile
$ cdk deploy --profile myprofile
...

The following o/p will be created upon completion - check the cloud formation stack in aws account

beam-workshop.WindowsDevEnvironmentInstanceIp9C0E1056 =
beam-workshop.WindowsDevEnvironmentInstanceLoginCredentials9CFB9646 =
beam-workshop.S3Bucket =
beam-workshop.ApplicationTerminatedTopicName =
beam-workshop.InputS3Pattern =
beam-workshop.FirehoseTransformationLambda =
beam-workshop.BeamConsumerJarPath = target/amazon-kinesis-analytics-beam-taxi-consumer-1.0-SNAPSHOT.jar

3. For Diffs run
$ cdk diff --profile myprofile
```
