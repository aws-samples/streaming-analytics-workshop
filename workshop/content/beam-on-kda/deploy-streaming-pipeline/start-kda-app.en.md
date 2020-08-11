---
title: "Start KDA application"
chapter: false
weight: 45
---

The application is finally ready for execution through the Kinesis Data Analytics service in a fully managed Flink environment. You can now start the execution and send events into the Kinesis data stream, this time with a substantially higher throughput. The Flink application will then continuously process the data that is ingested into the data stream and send derived insights to Elasticsearch for visualization.

1.  Once the update has completed, press **Run** on the resulting page and confirm that you want to run the application by choosing **Run** again. The application will now start in the background, which can take a couple of minutes. Once it is running, you can inspect the operator graph of the Flink application.

    ![kda-running-app](/images/beam-on-kda/kda-running-beamapp.png)

1. Make sure that you are still producing trip events into the Kinesis data stream. In case the application is no longer running, you can restart it by executing the following command in the console window of IntelliJ.

    {{< highlight plain >}}
java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-0.1.0.jar -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4 -aggregate -streamName beam-workshop -speedup 4320
    {{< /highlight >}}


{{% notice tip %}}
If you don't see the object graph after the Kinesis data analytics application is running please hit refresh in the browser. You can further debug the application by inspecting the application logs that are exposed through Amazon CloudWatch.
![kda-nographlog](/images/beam-on-kda/kda-nographlog.png)
Follow the link to the respective log stream and filter for **ERROR**
![kda-nographlogerror](/images/beam-on-kda/kda-nographlogerror.png)
{{% /notice %}}
