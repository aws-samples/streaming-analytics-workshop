+++
title = "Execute the batch pipeline"
date = 2020-07-10T10:27:27+02:00
weight = 30
+++

Now that the Flink cluster has been provisioned and we are connected to the Flink dashboard, we can execute the batch pipeline.

1. We first need to download the Jar file of the pipeline to the EMR cluster. Execute the command **DownloadJarFile** that you can find in the output section of the CloudFormation template. The command looks something like this:

	{{< highlight plain >}}
aws s3 cp ...
{{< /highlight >}}

1. You can then submit the Beam pipeline for execution on the Flink cluster. Copy the **StartBeamApplication** command from the output section of the CloudFormation template and execute it on the EMR cluster.

	{{< highlight plain >}}
flink run -p 8 amazon-kinesis-analytics-beam-taxi-consumer-1.0-SNAPSHOT.jar ...
{{< /highlight >}}

1. When the pipeline is running, you can track the progress in the Flink dashboard

	![](/images/beam-on-kda/emr-flink-dashboard-job.png)

1. Once the pipeline has completed, you can inspect the metrics for the boroughs that have been generated in [Amazon CloudWatch](https://console.aws.amazon.com/cloudwatch/home?dashboards:).  The graph shows count of taxi trips that are backfilled.

	![](/images/beam-on-kda/cw-dashboard-trips-backfilled.png)
