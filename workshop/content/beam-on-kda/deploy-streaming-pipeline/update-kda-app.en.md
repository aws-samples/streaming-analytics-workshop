---
title: "Update application parameters"
chapter: false
weight: 45
---

We will now update the application in Kinesis Data Analytics to start counting trips per borough by updating the configuration. This shows how we can use BEAM to count trips that cumulates by this new [metric](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/678096fcd8451f0d4d98871a3d3d97c63384d1fa/src/main/java/com/amazonaws/samples/beam/taxi/count/TaxiCount.java#L127).

The BEAM java class that does is [PartitionByBorough.java](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/master/src/main/java/com/amazonaws/samples/beam/taxi/count/PartitionByBorough.java).

1. Go back to the KDA Flink application and update the configuration. Select **Confiuration** and Scroll down to the **Properties** section you created earlier. Select **Edit group** for the group **BeamApplicationProperties**.

Update the property `OutputBoroughs` to `true`. Select **update** and wait a few minutes for the operator graph to update.

![kda-updateborough](/images/beam-on-kda/kda-updateborough.png)

1. Go back to the [CloudWatch Dashboard](https://console.aws.amazon.com/cloudwatch/), and hit refresh in top right. In the bottom graph you should start seeing trips that are counted per borough, similar to this. It appears for this data set the borough of Manhattan has the most trips!

![cw-dashboard-trips-by-borough](/images/beam-on-kda/cw-dashboard-trips-by-borough.png)
