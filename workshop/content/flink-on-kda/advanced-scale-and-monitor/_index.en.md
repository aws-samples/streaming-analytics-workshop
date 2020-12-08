---
title: "Advanced Scaling and Monitoring"
chapter: false
weight: 80
---

 There are many important operational metrics to measure when assessing the performance of a running Apache Flink Application. In this section, we will add on to the existing CloudWatch Dashboard to showcase many of these metrics. 

![put the picture of finalized CW Dashboard here](img/src)

 Next, we will utilize these metrics to influence the scaling behavior of the Apache Flink application. Using autoscaling groups, we will see how to utilize the `numRecordsInPerSecond` metric to scale up or down Flink Applications automatically.

 ![put the picture of autoscaling KPUs here](img/src)

----------------------------------

 Finally, we will dive into the Apache Flink Dashboard to look at Backpressure, Checkpointing and other Operational Performance Indicators.

![Flink Dashboard](/images/flink-on-kda/advanced-monitoring-index-3-flink-dashboard.png)