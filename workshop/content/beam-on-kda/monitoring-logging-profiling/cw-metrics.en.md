---
title: "Monitor important metrics"
chapter: false
weight: 71
---

Now that the Kinesis data stream is scaling, we'll take a look at how we can identify this overloading situation by looking at the metrics of the stream. To this end, we'll create a CloudWatch dashboard that displays some of the relevant metrics.

1. Navigate to the [CloudWatch console](https://console.aws.amazon.com/cloudwatch), click on **Dashboards** in the navigation pane on the left, and select the *BeamWorkshopDashboard* dashboard you have been using earlier.

1. Click on **Add widget** and choose the **Line** widget to compare metrics over time. Confirm with **Next**.

1. In the next dialog, choose *metrics* and confirm with **Configure**

1. Enter `beam-workshop` in the search field and select **Kinesis > Stream metrics**

   ![](/images/beam-on-kda/cw-dashboard-1-filter.png)

1. Select the **IncomingRecords** and **GetRecords.IteratorAgeMilliseconds** metrics and navigate to **Graphed metrics**

   ![](/images/beam-on-kda/cw-dashboard-2-select-metrics.png)

1. Adjust the period of both metrics to **1 Minute** and change the **Statistic** to _Sum_ and _Maximum_, respectively. Switch the **Y Axis** of the GetRecords.IteratorAgeMilliseconds metric and confirm with **Create**.

   ![](/images/beam-on-kda/cw-dashboard-3-metric-properties.png)

The dashboard now shows two metrics: the amount of incoming messages and the millisBehindLatest metric. The metric reports the time difference between the oldest record currently read by the Kinesis Data Analytics application and the latest record in the stream according to the ingestion time in milliseconds. So it indicates how much behind the processing is from the tip of the stream.

Other important metrics include, `ReadProvisionedThroughputExceeded` and `WriteProvisionedThroughputExceeded`. You can add them to the dashboard as well to see how the producer is throttled.

   ![](/images/beam-on-kda/cw-dashboard-5-scale-kds.png)
