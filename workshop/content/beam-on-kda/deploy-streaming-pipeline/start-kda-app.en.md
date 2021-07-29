---
title: "Start application"
chapter: false
weight: 45
---

The application is finally ready for execution through the Kinesis Data Analytics service in a fully managed Flink environment. You can now start the execution and send events into the Kinesis data stream. The Flink application will then continuously process the data that is ingested into the data stream and send derived insights to Amazon CloudWatch for visualization.

1.  Once the update has completed, press **Run** on the resulting page and confirm that you want to run the application *without a snapshot* by choosing **Run** again. The application will now start in the background, which can take a couple of minutes. Once it is running, you can inspect the operator graph of the Flink application.

    ![kda-running-app](/images/beam-on-kda/kda-running-beamapp.png)

    {{% notice tip %}}
If you don't see the object graph after the Kinesis data analytics application is running please hit refresh in the browser. You can further debug the application by inspecting the application logs that are exposed through Amazon CloudWatch.
{{% /notice %}}

2. Make sure that you are still producing trip events into the Kinesis data stream. In case the application is no longer running, you can restart it by executing the following command in the console window of IntelliJ.

    {{< highlight plain >}}
java -jar ./replay/amazon-kinesis-replay-*.jar -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4 -aggregate -streamName beam-workshop -speedup 720
    {{< /highlight >}}

1. Navigate to the [Amazon CloudWatch Console](https://console.aws.amazon.com/cloudwatch) and select **Dashboards**

1. Click on the dashboard whose name contains `BeamWorkshopDashboard`. The dashboard has already been pre-created for you and it contains two widgets, one displaying the total number of taxi trips and one for the number of taxi trips by borough. For now, the Beam application only generates the total amount, but we are going to change that in the next section.
    
	![](/images/beam-on-kda/cw-dashboard-total-number-trips.png)
