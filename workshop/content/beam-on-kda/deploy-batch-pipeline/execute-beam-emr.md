+++
title = "Execute the batch pipeline"
date = 2020-07-10T10:27:27+02:00
weight = 30
+++

Now that the Flink cluster has been provisioned and we are connected to the Flink dashboard, we can execute the batch pipeline.

1. We first need to download the Jar file of the pipeline to the EMR cluster. Execute the command **DownloadJarFile** that you can find in the output section of the CloudFormation template. The command looks something like this:

	{{< highlight plain >}}
aws s3 cp --recursive --exclude '*' --include 'amazon-kinesis-analytics-beam-taxi-consumer-1.0-SNAPSHOT.jar' 's3://«Bucket name»/target/' .
{{< /highlight >}}

1. You can then submit the pipeline job with the command **StartBeamApplication** from the output section of the CloudFormation template

	{{< highlight plain >}}
flink run -p 8 amazon-kinesis-analytics-beam-taxi-consumer-1.0-SNAPSHOT.jar --runner=FlinkRunner --awsRegion=«Region name» --source=s3 --inputS3Pattern=s3://«Bucket name»/historic-trip-events/*/*/*/*/* --outputBoroughs=true
{{< /highlight >}}

1. When the pipeline is running, you can track the progress in the Flink dashboard

	TODO: insert image of ui

1. Once the pipeline has completed, you can inspect the metrics for the boroughs that have been generated in Amazon CloudWatch

	TODO: insert image of CW dashboard
