---
title: "Start KDA application"
chapter: false
weight: 60
---

The application is finally ready for execution through the Kinesis Data Analytics service in a fully managed Flink environment. You can now start the execution and send events into the Kinesis data stream, this time with a substantially higher throughput. The Flink application will then continuously process the data that is ingested into the data stream and send derived insights to Elasticsearch for visualization.

{{% notice warning %}}
Before you proceed, make sure that you are currently not producing any events into the Kinesis stream. Navigate to the Terminal pane in IntelliJ and if the Java producer application is still running, terminate it by pressing *Ctrl-C*.
{{% /notice %}}

1. Once the update has completed, press **Run** on the resulting page and confirm that you want to run the application by choosing **Run** again. 

1. When promted, confirm to *Run without snapshot* and press the blue **Run** button. The application will now start in the background, which can take a couple of minutes. Once it is running, you can inspect the operator graph of the Flink application. 

	![](/images/flink-on-kda/kda-running-app.png)

2. You can now start producing data into the Kinesis stream again. However, this time we can substantially increase the speedup factor and hence the throughput of events.

	{{< highlight plain >}}
java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-0.1.0.jar -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4 -aggregate -streamName streaming-analytics-workshop -speedup 4320
{{< /highlight >}}
