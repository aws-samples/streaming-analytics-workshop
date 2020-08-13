---
title: "Overview"
chapter: false
disableToc: false
weight: 1
---

This workshop walks through a sample Apache BEAM pipeline that can be deployed to [Amazon Kinesis Data Analytics](https://aws.amazon.com/kinesis/data-analytics/) for Java Applications. It reads [New York City taxi](https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page) events from a [Kinesis data stream](https://aws.amazon.com/kinesis/), processes and aggregates them, and ingests the result to [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) for visualization. The workshop is structured in the following way.

1. To begin the workshop, you connect to a Windows instance that has already been provisioned and serves as a development environment. The instance has already been preinstalled with IntelliJ as the IDE and other dependencies that are required throughout the workshop.

1. You then start creating the infrastructure that is ingesting the event and persisting the raw data to Amazon S3. To this end, you create a Kinesis data stream to ingest the events and a Firehose delivery stream, that consumes the event from the data stream and persists them to Amazon S3. Once the infrastructure is ready, you use a Java application to replay a public data set of historic taxi trips made in New York City into the data stream.

1. You then compile a Beam pipeline and deploy it to Amazon Kinesis Data Analytics, which provides a managed Apache Flink environment. The Beam pipeline is aggregating the number of trips and generated revenue and persists the result into Amazon CloudWatch where it can be visualized through a real-time dashboard.

1. Once the application is running, you will take a closer look at the source code and learn how to best integrate a Beam pipeline with Amazon Kinesis Data Analytics.

Eventually, you need to adapt the output obtain a more fine grained visualisation per borough instead of the entire city. You can adapt the output by changing the parameters of the Beam pipeline. However, this only produces the additional metrics for new events. To derive this information for past events, you need to backfill the additional metrics using the raw data that has been persisted to Amazon S3.

4. To run the Beam pipeline in a batch fashion, you provision an Apache Flink cluster on Amazon Elastic Map Reduce (Amazon EMR). You can then submit the same Beam pipeline you have been using in streaming mode to backfill the additional metrics.

1. You can then optionally add monitoring and logging capabilities to the Beam application to monitor the health of the streaming application.

{{% notice info %}}
The code for this workshop is located at [https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer) github repository.
{{% /notice %}}
