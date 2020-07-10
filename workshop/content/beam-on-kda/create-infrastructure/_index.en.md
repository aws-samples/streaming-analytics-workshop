+++
title = "Create Infrastructure"
date = 2020-07-10T10:14:06+02:00
weight = 40
chapter = true
+++

- create Kinesis stream
- create Firehose delivery stream
  - attach Lambda function that ingests aproximate arrival time into event payload(pre-create lambda function with cdk/cfn)
- start replaying data into the Kinesis stream
