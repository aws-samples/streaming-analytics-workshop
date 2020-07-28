---
title: "Create Infrastructure"
date: 2020-07-10T10:14:06+02:00
weight: 30
chapter: false
---

In this chapter, you will set up the infrastructure within AWS to focus on the ingestion, streaming and transformation part of the architecture.

A [Kinesis Data Stream](https://aws.amazon.com/kinesis/data-streams/) is created which serves as a short term streaming store for the events that are created by the taxi fleet. You then start producing a historic set of taxi trips into the Kinesis data stream.

The Kinesis data stream (`beam-workshop`) serves as a buffer that decouples the producers from the consumers. It is a common pattern for architectures that are analyzing streaming data to separate producers from consumers by means of a streaming store. In this way, the architecture becomes more robust. Producers and consumers can be scaled independently and producers can still persist events into the data stream even if the consumers are currently experiencing operational problems or the consuming application needs to be updated.

A [Kinesis Data Firehose](https://aws.amazon.com/kinesis/data-firehose/) (`beam-workshop-s3`) is also created to perform any enrichment and transformaton on the data prior to it being loaded into data lakes, data stores and analytical tools. These data transformations are performed by invoking [AWS Lambda](https://aws.amazon.com/lambda/), a serverless platform that runs code without provisioning or managing servers. For this architecture we will store the transformed data into AWS S3 so that it can be read by our BEAM pipeline.

This infrastructure also allows you to experiment and adopt new technologies in the future. Multiple independent applications can concurrently consume the data stored in the Kinesis data stream. You can then test how a new version of an existing application performs with a copy of the production traffic. But you can also introduce a different tool and technology stack to analyze the data, again without affecting the existing production application.

---

NOTES:

- create Kinesis stream
  - stream name: beam-workshop
  - number shards: 4
- create Firehose delivery stream
  - delivery stream name: beam-workshop
  - source: kinesis data stream (beam-workshop)
  - transform source records
    - choose precreated lambda function (see cfn output `FirehoseTransformationLambda`)
    - there will be sevearl lambda functions, the one with EnrichEventsLambda in the name is the correct one
  - choose `historic-trip-events/` as a prefix
  - disable record format conversion
  - choose S3 bucket (see cfn output `S3Bucket`)
  - choose buffer size 60 sec
    - explain this is for the workshop, in general a larger value is more desirable
  - enable GZIP compression
- start replaying data into the Kinesis stream
  - open terminal in intellij
  - execute `java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-0.1.0.jar -streamName beam-workshop -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4/dropoff_year=2018/ -speedup 720`
