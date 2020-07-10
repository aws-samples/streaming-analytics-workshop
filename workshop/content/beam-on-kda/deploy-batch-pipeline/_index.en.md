+++
title = "Deploy Batch Pipeline"
date = 2020-07-10T10:27:27+02:00
weight = 60
chapter = true
+++

- explain workaround on how a batch program can be stopped
- only have partiticpants create the metric filter (the actual interesting part)
  - use a fixed namespace and metric name
  - create all other resources through cdk/cfn
    - Alarm on the metric
    - SNS subscription
    - Lambda function
    - https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/master/cdk/lib/kinesis-analytics-infrastructure.ts#L149-L168
- change the running streaming program into a batch program