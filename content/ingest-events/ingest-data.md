---
title: "Replay historic taxi trips"
chapter: false
weight: 16
---

We will use a Java application to replay a historic set of taxi trips made in NYC that are stored in objects in Amazon S3 into the Kinesis stream.
The java application has already been compiled and loaded onto the EC2 instance for your convenience. The sources, including a CloudFormation template to build the Java application with CodePipeline, are available from [GitHub](https://github.com/aws-samples/amazon-kinesis-replay).



1. Start the Intellij IDE by double clicking the icon on the desktop

1. Click on the **Terminal** icon in the bottom of Intellij to open a shell

	![](/images/intellij-3-ingest.png)

1. Enter the following command into the terminal prompt to start ingesting events into the Kinesis data stream

	```
java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-1.0-SNAPSHOT.jar -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4 -aggregate -streamName streaming-analytics-workshop -speedup 600
	```
