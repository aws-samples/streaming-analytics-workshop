---
title: "Advanced Scaling and Monitoring"
chapter: false
weight: 80
---

 There are many important operational metrics to measure when assessing the performance of a running Apache Flink Application. In this section, we will look at the important CloudWatch metrics for Kinesis Data Analytics for Apache Flink applications, what they mean and what appropriate alarms might be for each.

![Picture of CloudWatch Monitoring Dashboard](/images/flink-on-kda/advanced-monitoring-index-1-cw-dashboard.png?classes=border,shadow)

---------------------------------

 Next, we will utilize these metrics to influence the scaling behavior of the Apache Flink application. Using autoscaling groups, we will see how to utilize the `numRecordsInPerSecond` metric to scale up or down Flink Applications automatically.

 ![CW Alarm](/images/flink-on-kda/cw-in-alarm.png)

----------------------------------

 Finally, we will dive into the Apache Flink Dashboard to look at Backpressure, Checkpointing and other Operational Performance Indicators.

![Picture of Flink Dashboard](/images/flink-on-kda/advanced-monitoring-index-3-flink-dashboard.png?classes=border,shadow)