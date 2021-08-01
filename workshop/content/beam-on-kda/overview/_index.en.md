---
title: "Overview"
chapter: false
disableToc: false
weight: 1
---

This workshop walks through a sample Apache Beam pipeline that can be deployed to [Amazon Kinesis Data Analytics](https://aws.amazon.com/kinesis/data-analytics/). It reads [New York City taxi](https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page) events from a [Kinesis data stream](https://aws.amazon.com/kinesis/), processes and aggregates them, and ingests the result to [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) for visualization. The workshop is structured in the following way.

1. To begin the workshop, you connect to a AWS Cloud9 development environment. You will prepare the development environment using a simple script.

2. You then start creating the infrastructure that is ingesting the event and persisting the raw data to Amazon S3. To this end, you create a Kinesis data stream to ingest the events and a Firehose delivery stream, that consumes the event from the data stream and persists them to Amazon S3. Once the infrastructure is ready, you use a Java application to replay a public data set of historic taxi trips made in New York City into the data stream.

3. You then compile a Beam pipeline and deploy it to Amazon Kinesis Data Analytics, which provides a managed Apache Flink environment. The Beam pipeline is aggregating the number of trips and persists the result into Amazon CloudWatch where it can be visualized through a real-time dashboard.

4. Once the application is running, you will take a closer look at the source code and learn how to best integrate a Beam pipeline with Amazon Kinesis Data Analytics.

5. Once the Beam pipeline is operating properly, you adapt the pipeline to generate a more fine grained visualisation per borough instead of the entire city. You implement the change by adapting the parameters of the Beam pipeline. However, this only produces the additional metrics for new events. To derive this information for past events, you need to backfill the additional metrics using the raw data that has been persisted to Amazon S3.

6. You will configure the same Apache Beam pipeline to process data stored in Amazon S3 in a batch fashion. You will experience the power of Apache Beam application to unify stream and batch processing using Amazon Kinesis Data Analytics.

7. You can then optionally add profiling(Amazon CodeGuru), monitoring and logging capabilities to the Beam application to monitor the health of the streaming application.

{{% notice info %}}
The code for this workshop is located at [https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer) github repository.
{{% /notice %}}
