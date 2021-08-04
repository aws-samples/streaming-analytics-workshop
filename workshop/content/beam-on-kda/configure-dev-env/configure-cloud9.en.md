---
title: "Configure AWS Cloud9"
chapter: false
weight: 21
---

The AWS Cloud9 development environment is created for you as part of the CloudFormation template. You have to complete the configuration of the environment by following the steps below:

1. Navigate to the [AWS Cloud9 console](https://console.aws.amazon.com/cloud9/home). If you are running the workshop on your own the environment is called *beam-workshop*. If you are attending an AWS hosted event, there is only one development environment available in the account. Once you have found the development environment, click on the **Open IDE** button.

1. The code [repository](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer) is automatically cloned into your environment the first time you open the IDE.

1. Open a terminal window by choosing **Window** and then **New Terminal** form the menu bar at the top. Execute the following commands to configure your environment.
    {{< highlight bash >}}
sh ./code/misc/prepare-env.sh -s $C9_PROJECT
{{< / highlight >}}

1. The last output that is generated should look like the following:
    {{< highlight bash >}}
download: s3://beam-workshop-historictripsef9d049f-8lf5u3xscqz4/target/amazon-kinesis-replay-0.1.0.jar to replay/amazon-kinesis-replay-0.1.0.jar
download: s3://beam-workshop-historictripsef9d049f-8lf5u3xscqz4/target/amazon-kinesis-analytics-beam-taxi-consumer-0.2.0.jar to replay/amazon-kinesis-analytics-beam-taxi-consumer-0.2.0.jar
{{< / highlight >}}
