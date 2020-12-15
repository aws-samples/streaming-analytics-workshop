---
title: "Getting Started"
chapter: true
weight: 130
---


To add functionality of scaling based on other metrics, we will utilize [Application Autoscaling](https://docs.aws.amazon.com/autoscaling/application/userguide/what-is-application-auto-scaling.html) to specify our scaling policy as well as other attributes such as cooldown periods. We can also take advantage of any of the autoscaling types--step scaling, target tracking scaling, and schedule-based scaling. The CloudFormation template we will launch will cover step-scaling, but you can review further functionality in [this Github Repository](https://github.com/aws-samples/kda-flink-app-autoscaling).

[![Launch CloudFormation Stack](/images/flink-on-kda/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=kda-advanced-monitoring-dashboard&templateURL=https://aws-data-analytics-workshops.s3.amazonaws.com/kinesis/templates/sample-dashboard.yaml)

Let's create this stack and dig into the details of how it works. Click the link above to Launch The Stack, and fill in the necessary details about the workload we've built thus far.