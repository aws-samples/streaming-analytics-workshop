+++
title = "Execute the batch pipeline"
date = 2020-07-10T10:27:27+02:00
weight = 30
+++

1. Once the update is completed and the application is running again, inspect the updated job graph. You can see how the structure of the application graph changed, as the Beam pipeline has generated a different job graph for the batch application.

	![KDA batch job graph](/images/beam-on-kda/kda-patch-job-graph.png)

1. Navigate to the Flink dashboard by clicking on **Open Apache Flink dashboard** at the top of the page

1. Select the only job from the **Runing Job List** to track the progress of the execution

	![KDA batch job graph](/images/beam-on-kda/kda-batch-flink-dashboard.png)

1. Once the pipeline has completed, you can inspect the metrics for the boroughs that have been generated in [Amazon CloudWatch](https://console.aws.amazon.com/cloudwatch/home?dashboards:).  The graph shows count of taxi trips that are backfilled.

	![](/images/beam-on-kda/cw-dashboard-trips-backfilled.png)
