+++
title = "Deploy Streaming Pipeline"
date = 2020-07-10T10:27:19+02:00
weight = 50
chapter = true
+++

- compile beam pipeline to jar file
  - jar file has already been compiled and uploaded through code commit
- create kda application
  - application name `beam-workshop` (this is very important to get right for later)
  - runtime: apache flink 1.8
  - TODO: precreate a IAM role with cdk/cfn and choose it here
    - role needs to be able to read from kinesis stream (beam-workshop) and write to cloudwatch (metrics and logs)
- configure
  - s3 bucket: beam-workshop-* (see cfn output `S3Bucket`)
  - path: target/amazon-kinesis-analytics-beam-taxi-consumer-*.jar (see cfn output `BeamConsumerJarPath`)
  - properties
    - group id: BeamApplicationProperties
    - InputStreamName: beam-workshop
    - OutputBoroughs: false
    - Source: kinesis
  - disable snapshots
  - monitoring
    - task level
    - enable cloudwatch logs
  - parallelism: 2
  - update
- run application
  - take a look at flink application graph
- create dashboard to visualize 
  - create dashboard: beam-workshop
  - line graph
    - custom namspace: beam
    - metric: stream name
    - choose: beam-workshop
    - statistics: maximum
    - period: 1 second

