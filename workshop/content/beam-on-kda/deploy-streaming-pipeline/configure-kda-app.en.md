---
title: "Configure KDA application"
chapter: false
weight: 43
---

The skeleton of the application has now been created. But you still need to adapt important configuration options, including the location of the Jar file on S3, the name of the Kinesis data stream to read from, setting the sclaing parallelism and configuring the BEAM job parameters.

1. On the resulting page press the blue **Configure** button to configure the Kinesis Analytics application.

1. Enter the bucket and prefix of the compiled jar file under **Amazon S3 bucket** and **Path to Amazon S3 object**. You can obtain the correct values from the Output section of the CloudFormation template under **S3Bucket** `beam-workshop-bucket....` and **BeamConsumerJarPath** `target/amazon-kinesis-analytics-beam-taxi-consumer-1.0-SNAPSHOT.jar`.

   ![Configure KDA Application CloudFormation](/images/kda-cf.png)

   ![Configure KDA Application](/images/kda-config.png)

1. Expand the **Properties** section and select **Create group**.

1. In the resulting dialog, choose `BeamApplicationProperties` as **Group ID** and add the following three key/value pairs and confirm with **Save**:

   1. `InputStreamName` with the name of the Kinesis stream you've created earlier, eg, `beam-workshop`
   1. `Source` set the source IO for BEAM pipeline to `kinesis` in **lowercase**
   1. `OutputBoroughs` set to `false` as we will not use the is information from the BEAM pipeline

   {{% notice info %}}
   We set the `OutputBoroughs` to `false` as the idea is to use the streaming application to just count the number of trips. Then, the if requirements will change we can break this down into by boroughs.
   If we weren’t using BEAM we would now need to build another batch appliction to backfill the new metric for historic data, but now we can just use the same application to backfill the metric for historic data in a batch mode and in streaming mode for new data. Voila, unifying data processing in `B`atch and str`EAM`.
   {{% /notice %}}

   ![Configure Property Group](/images/kda-prop-grp1.png)

1. Expand the **Snapshots** section and **Disable** snapshots for the application

   {{% notice info %}}
   Enabling snapshots allows the service to maintain the state of a Flink application in case of application updates but also when recovering from infrastructure or application errors. So for production environments it is highly desirable to keep snapshots enabled.
   {{% /notice %}}

1. Expand the **Monitoring** section. Select **Task** as **Monitoring metrics level** and enable **CloudWatch** logging. Select **Info** as the Monitoring Log Level

1. For parallelism we will set to 2. This determines the [scaling](https://docs.aws.amazon.com/kinesisanalytics/latest/java/how-scaling.html) factor used for the application within KDA. Leave the parallelism per KPU as default to 1. To learn more about how KDA does scaling see [here](https://docs.aws.amazon.com/kinesisanalytics/latest/java/how-scaling.html).

   {{% notice info %}}
   Parallelism — This property to set the default Apache Flink application parallelism. All operators, sources, and sinks execute with this parallelism unless they are overridden in the application code. The default is 1, and the default maximum is 256.

   ParallelismPerKPU — This property to set the number of parallel tasks that can be scheduled per Kinesis Processing Unit (KPU) of your application. The default is 1, and the maximum is 8. For applications that have blocking operations (for example, I/O), a higher value of ParallelismPerKPU leads to full utilization of KPU resources.
   {{% /notice %}}

   ![Configure Monitoring](/images/kda-monitor-novpc.png)

1. Keep the default settings for **Scaling** and **VPC Connectivity** and press the blue **Update** button at the bottom of the page to update the properties of the application. After a few minutes the application will be ready to run.

   ![Configure Complete](/images/kda-configure-review.png)
