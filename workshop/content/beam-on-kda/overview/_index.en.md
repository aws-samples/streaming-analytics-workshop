---
title: "Overview"
chapter: false
disableToc: false
weight: 1
---

### Amazon Kinesis Analytics Beam Taxi Consumer

This workshop walks through a sample Apache BEAM pipeline that can be deployed to [Kinesis Data Analytics](https://aws.amazon.com/kinesis/data-analytics/) for Java Applications. It reads [New York City taxi](https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page) events from a [Kinesis data stream](https://aws.amazon.com/kinesis/), processes and aggregates them, and ingests the result to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) for visualization.

TODO THIS DIAGRAM NEEDS UPDATING ie with oir without batch
![Overview BEAM Architecture](/images/overview-beamarchitecture.png)

1. To populate the Kinesis data stream, you use a Java application that replays a public data set of historic taxi trips made in New York City into the data stream. The Java application can be downloaded to an [AWS EC2](https://aws.amazon.com/ec2/) instance that has been provisioned by [AWS CloudFormation](https://aws.amazon.com/cloudformation/), you just need to connect to the instance to download and execute the jar file to start ingesting events into the stream.

1. Once data is being ingested into the Kinesis data stream, you can start the processing with the Beam pipeline. Just navigate to the created Kinesis Data Analytics application in the management console and press the run button. You can then find the generated metrics in an Amazon CloudWatch dashboard that has already been created.

1. In addition you transform the NYC taxi data that you read into [AWS S3](https://aws.amazon.com/s3/) after you apply a transformation to it using [AWS Kinesis FireHose](https://aws.amazon.com/kinesis/data-firehose). This is so you can correlate batch and streaming data points correctly.

1. By default, the Beam pipeline will only output of the overall trip count. To obtain a more fine grained visualisation per borough, you need to change the configuration of the application. This is done by navigating to the Kinesis Analytics application and changing the configuration of the property `OutputBoroughs` from `false` to `true` in the property group `BeamApplicationProperties`.

1. Once the application has been reconfigured and is running again, it will output the trip count per borough for all new events. However, it does not backfill these metrics for events that have already been processed.

1. To backfill these fine grained metrics for historic values, you can execute the Beam pipeline in a batch processing fashion using AWS Kinesis Data Analytics in a fully managed Flink environment. You just need to change the `Source` to `s3` in the properties section of the KDA application. Once the backfill job completes, an [AWS Lambda](https://aws.amazon.com/lambda/) function that is monitoring the appliaction output through a CloudWatch metric filter will stop the KDA application.

![Overview CloudWatch](/images/overview-cw.png)
