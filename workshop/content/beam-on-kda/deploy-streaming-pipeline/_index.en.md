---
title: "Deploy Streaming Pipeline"
menuTitle: "Deploy Streaming Pipeline"
chapter: false
weight: 30
---

In this chapter, you will set up a managed Flink Cluster using [AWS Kinesis Data Analytics](https://aws.amazon.com/kinesis/data-analytics/faqs/?nc=sn&loc=6) service and use that as a [BEAM runner engine](https://beam.apache.org/documentation/runners/flink/). You will deploy a pre-compiled BEAM pipeline written in Java and run that as an application within KDA to read the Kinesis stream created earlier and analyse the NYC taxi data in real-time.

You will deploy the jar to an [AWS S3 Bucket](https://aws.amazon.com/s3/) and add that as a configuration paramater to a Flink Job. You can inspect the application using the operator graph in KDA when it is running.

We will visualise the BEAM application metrics using [AWS Cloud Watch](https://aws.amazon.com/cloudwatch/)

{{% notice info %}}
At time of writing KDA supports release [Apache Flink 1.8](https://flink.apache.org/news/2019/04/09/release-1.8.0.html), you can read more about this support from AWS [here](https://aws.amazon.com/about-aws/whats-new/2019/12/amazon-kinesis-data-analytics-now-supports-apache-flink-18/)
{{% /notice %}}

---

Notes

- compile beam pipeline to jar file
  - jar file has already been compiled and uploaded through code commit
- create kda application
  - application name `beam-workshop` (this is very important to get right for later)
  - runtime: apache flink 1.8
  - TODO: precreate a IAM role with cdk/cfn and choose it here
    - role needs to be able to read from kinesis stream (beam-workshop) and write to cloudwatch (metrics and logs)
- configure
  - s3 bucket: beam-workshop-\* (see cfn output `S3Bucket`)
  - path: target/amazon-kinesis-analytics-beam-taxi-consumer-\*.jar (see cfn output `BeamConsumerJarPath`)
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
