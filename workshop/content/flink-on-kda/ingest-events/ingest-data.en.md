---
title: "Replay historic taxi trips"
chapter: false
weight: 16
---

We will use a Java application to replay a historic set of taxi trips made in NYC that are stored in objects in Amazon S3 into the Kinesis stream.
The Java application has already been compiled and loaded onto the EC2 instance. If you are interested in the details of the application, you can obtain the sources, including a CloudFormation template to build the Java application with Amazon CodePipeline, from [GitHub](https://github.com/aws-samples/amazon-kinesis-replay).

1. Click on the **Terminal** icon in the bottom of Intellij to open a shell

	![](/images/flink-on-kda/intellij-3-ingest.png)

1. Enter the following command into the terminal prompt to start producing events into the Kinesis data stream

	{{< highlight plain >}}
java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-0.1.0.jar -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4 -aggregate -streamName streaming-analytics-workshop -speedup 600
{{< /highlight >}}
