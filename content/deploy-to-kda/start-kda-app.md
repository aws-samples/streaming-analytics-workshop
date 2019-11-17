---
title: "Start KDA application"
chapter: false
weight: 60
---

{{% notice warning %}}
Before you proceed, make sure that you are currently not ingesting any events into the Kinesis stream. Navigate to the Terminal in IntelliJ and if the Java producer application is still running, terminate it by pressing **Ctrl-C**.
{{% /notice %}}

1. Once the update has completed, press **Run** on the resulting page and confirm that you want to run the application by choosing **Run** again. The application will now start in the background, which can take a couple of minutes. Once it is running, you can inspect the operator graph of the Flink application. The application is continuously processing the data that is ingested into the Kinesis stream and sends derived insights to Elasticsearch for visualization.

	![](/images/kda-running-app.png)

2. You can now start ingesting data into the Kinesis stream again. However, this time we can substantially increase the speedup factor and hence the throughput of events.

	```
java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-1.0-SNAPSHOT.jar -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4 -aggregate -streamName streaming-analytics-workshop -speedup 4320 
	```
