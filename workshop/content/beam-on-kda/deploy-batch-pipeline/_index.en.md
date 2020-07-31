+++
title = "Deploy Batch Pipeline"
date = 2020-07-10T10:27:27+02:00
weight = 70
chapter = true
+++

- explain workaround on how a batch program can be stopped
- create metric filter that shuts down application
  - in cloudwatch go to log groups
  - search for `/aws/kinesis-analytics/beam-workshop`
  - select log group and choose create log filter
  - filter pattern: Job reached globally terminal state FINISHED
  - Metric Namespace: Beam
  - Metric Name: BeamApplicationFinished
- create alarm:
  - statistics: sum
  - period: 10 sec
  - greater than 1
  - treat missing data as good (not breaching)  
  - select an existing sns topic: beam-workshop-* (see cfn output `ApplicationTerminatedTopic`)
  - alarm name: beam-workshop
- change the running streaming program into a batch program
  - change properties
    - InputS3Pattern: `s3://<<bucket name>>/historic-trip-events/*/*/*/*/*` (see cfn output `InputS3Pattern`)
    - change source to: s3
    - change output borough: true
  - disable auto scaling
  - change parallelism: 4
  - ensure that snapshots are disabled
- add metric for boroughs to dashboard
  - namespace: beam
  - metric: borough, stream name
  - select all boroughs
  - rest as before
