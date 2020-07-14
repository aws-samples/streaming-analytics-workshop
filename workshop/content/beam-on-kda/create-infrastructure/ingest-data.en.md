---
title: "Replay historic taxi trips"
chapter: false
weight: 16
---

We will use a Java application to replay a historic set of taxi trips made in NYC that are stored in objects in Amazon S3 into the Kinesis stream.
The Java application has already been compiled and loaded onto the EC2 instance. If you are interested in the details of the application, you can obtain the sources, including a CloudFormation template to build the Java application with Amazon CodePipeline, from [GitHub](https://github.com/aws-samples/amazon-kinesis-replay).

{{% notice info %}}
IntelliJ will eventually display an error message that the *flink-connector-kinesis* artifact could not be found on Maven central. That is fine for now, we will address it in one of the future steps.
{{% /notice %}}

1. Click on the **Terminal** icon in the bottom of Intellij to open a shell

	![](/images/intellij-3-ingest.png)

1. Enter the following command into the terminal prompt to start producing events into the Kinesis data stream created earlier, *"beam-workshop"*

	{{< highlight plain >}}
java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-0.1.0.jar -streamName beam-workshop -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4/dropoff_year=2018/ -speedup 720
{{< /highlight >}}
