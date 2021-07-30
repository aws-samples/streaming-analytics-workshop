---
title: "Replay historic taxi trips"
chapter: false
weight: 32
---

We will use a Java application to replay a historic set of taxi trips made in NYC that are stored in objects in Amazon S3 into the Kinesis stream.
The Java application has already been compiled and loaded onto the Cloud9 development environment. If you are interested in the details of the application, you can obtain the sources, including a CloudFormation template to build the Java application with Amazon CodePipeline, from [GitHub](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer).

1.  Navigate back to the terminal window in the Cloud9 IDE.

2.  Enter the following command into the terminal prompt to start producing events into the Kinesis data stream created earlier, `beam-workshop`.

	{{< highlight plain >}}
java -jar ./replay/amazon-kinesis-replay-*.jar -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4/dropoff_year=2018/ -speedup 720 -streamName beam-workshop
{{< /highlight >}}

	You should see lines similar to the one below in the terminal if the above operation was successful. Please keep the ingestion running while you continue with the next step.

	{{< highlight plain >}}
INFO   StreamPopulator - all events with dropoff time until 2018-01-01T04:36:21Z have been sent (3442.0 events/sec, PT-1S replay lag)
{{< /highlight >}}

