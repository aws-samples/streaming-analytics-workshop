---
title: "Getting Started"
chapter: true
weight: 130
---


To add functionality of scaling based on other metrics, we will utilize [Application Autoscaling](https://docs.aws.amazon.com/autoscaling/application/userguide/what-is-application-auto-scaling.html) to specify our scaling policy as well as other attributes such as cooldown periods. We can also take advantage of any of the autoscaling types--step scaling, target tracking scaling, and schedule-based scaling. The CloudFormation template we will launch will cover step-scaling, but you can review further functionality in [this Github Repository](https://github.com/aws-samples/kda-flink-app-autoscaling).

![Application Autoscaling CW Alarm](/images/flink-on-kda/enhanced-monitoring-1.jpg)


[![Launch CloudFormation Stack](/images/flink-on-kda/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=kda-advanced-scaling&templateURL=https://aws-data-analytics-workshops.s3.amazonaws.com/kinesis/templates/streaming-analytics-workshop/step-scaling.yaml)

Let's create this stack and dig into the details of how it works. Click the link above to Launch The Stack, and fill in the necessary details about the workload we've built thus far.

The above image illustrates the resources that will be created during the launch of this CloudFormation Template. For a more detailed list, view the Resources Tab in the CloudFormation console after launched, or view in designer before launching.


![Create Stack](/images/flink-on-kda/advanced-scaling-cfn-1-create-stack.png)


## Fill out necessary stack details
- Most should be pre-filled for you, but double check to see if they are correct for your workload.
![Stack Details](/images/flink-on-kda/advanced-scaling-cfn-2-stack-details.png)

#### Hit next, skipping Advanced Options

## On the last page, allow permissions for CloudFormation to auto-create IAM resources, and the CAPABILITY_AUTO_EXPAND capability.
![Allow Capabilities](/images/flink-on-kda/advanced-scaling-cfn-3-capabilities.png)

The stack should take no longer than 5 minutes to complete. Look for the `CREATE_COMPLETE` message in the stack events for a signal to move forward.

## Let's dive deeper into what we've just launched...















