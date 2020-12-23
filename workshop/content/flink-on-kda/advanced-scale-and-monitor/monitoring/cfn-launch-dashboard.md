---
title: "Launch the CloudWatch Dashboard"
chapter: true
weight: 100
---

There are quite a few metrics to keep track of and create widgets for. To simplify things, you can launch a CloudFormation Template for the running application which highlights each of these metrics. Let's do that now. 

[![Launch CloudFormation Stack](/images/flink-on-kda/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=kda-advanced-monitoring-dashboard&templateURL=https://aws-data-analytics-workshops.s3.amazonaws.com/kinesis/templates/streaming-analytics-workshop/sample-dashboard.yaml)


Click the link above to Launch The Stack, and fill in the necessary details about the workload we've built thus far.

{{% notice tip %}} 
If you haven't built the resources for this lab, please navigate to the [lab which includes these instructions.](/flink-on-kda/getting-started/)
{{% /notice %}}

### On the new CloudFormation setup page, click next.

![CloudFormation Setup Screenshot](/images/flink-on-kda/advanced-monitoring-metrics-1-cfn-launch.png)

### Fill out the necessary details for your existing workload.

![CloudFormation Setup Screenshot](/images/flink-on-kda/advanced-monitoring-metrics-2-cfn-launch.png)


### Hit Next and then Create Stack.

![CloudFormation Setup Screenshot](/images/flink-on-kda/advanced-monitoring-metrics-4-cfn-launch.png)


![CloudFormation Setup Screenshot](/images/flink-on-kda/advanced-monitoring-metrics-5-cfn-launch.png)


This dashboard should take less than 30 seconds to launch, so open up the outputs tab once it finishes and click on the CloudWatch Dashboard link. I'll meet you on the next page! 

