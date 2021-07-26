---
title: "Update application parameters"
chapter: false
weight: 45
---

We will now update the application in Kinesis Data Analytics to start counting trips per borough by updating the configuration. This shows how we can use Beam to count trips that cumulates by this new [metric](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/678096fcd8451f0d4d98871a3d3d97c63384d1fa/src/main/java/com/amazonaws/samples/beam/taxi/count/TaxiCount.java#L127).

The Beam Java class that does is [PartitionByBorough.java](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/master/src/main/java/com/amazonaws/samples/beam/taxi/count/PartitionByBorough.java).

1. Go back to the Kinesis Data Analytics application and update the configuration. Select **Confiuration** and Scroll down to the **Properties** section you created earlier. Select **Edit group** for the group **BeamApplicationProperties**.

1. Update the property `OutputBoroughs` to `true`. Select **update** and wait a few minutes for the operator graph to update.

    ![kda-updateborough](/images/beam-on-kda/kda-updateborough.png)


Changing this setting will change the internal application logic. Initially, the Beam application was using a global window to count all trip events in a 5 second window.

{{< highlight java >}}
      metrics = window
          .apply("Count globally", Combine
              .globally(Count.<TripEvent>combineFn())
              .withoutDefaults()
          )
{{< / highlight >}}

By adapting the parameter, the application will now first partition the trip events by their respective brough and then count the trip event per borough in the same 5 second window.

{{< highlight java >}}
      metrics = window
          .apply("Partition by borough", ParDo.of(new PartitionByBorough()))
          .apply("Count per borough", Count.perKey())
{{< / highlight >}}

In both cases, the result is sent to Amazon CloudWatch for visualization.

3. Go back to the [CloudWatch dashboard](https://console.aws.amazon.com/cloudwatch/), and hit refresh in top right. In the bottom graph you should start seeing trips that are counted per borough, similar to this. It appears for this data set the borough of Manhattan has the most trips!

![cw-dashboard-trips-by-borough](/images/beam-on-kda/cw-dashboard-trips-by-borough.png)
