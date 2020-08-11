---
title: "Deploy Streaming Pipeline"
menuTitle: "Deploy Streaming Pipeline"
chapter: false
weight: 40
---

In this chapter, you will set up a managed Flink Cluster using [Amazon Kinesis Data Analytics](https://aws.amazon.com/kinesis/data-analytics/faqs/?nc=sn&loc=6) service and use that as a [BEAM runner engine](https://beam.apache.org/documentation/runners/flink/). You will deploy a pre-compiled BEAM pipeline written in Java and run that as an application within Kinesis Data Analytics to read the Kinesis stream created earlier and analyse the NYC taxi data in real-time.

You will deploy the jar to an [Amazon S3 Bucket](https://aws.amazon.com/s3/) and add that as a configuration parameter to an Apache Flink Job. You can inspect the application using the operator graph in Kinesis Data Analytics when it is running.

We will visualise the BEAM application metrics using [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/).
