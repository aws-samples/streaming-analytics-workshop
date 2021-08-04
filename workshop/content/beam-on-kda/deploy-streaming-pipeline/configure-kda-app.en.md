---
title: "Configure application"
chapter: false
weight: 43
---

The skeleton of the application has now been created. But you still need to adapt important configuration options, including the location of the Jar file on Amazon S3, the name of the Kinesis data stream to read from, setting the parallelism and configuring the Beam job parameters.

1. On the resulting page press the blue **Configure** button to configure the Kinesis Data Analytics application.

1. Under **Amazon S3 bucket** select the bucket name containing `historictrips` that we have been using earlier. Enter `target/amazon-kinesis-analytics-beam-taxi-consumer-0.2.0.jar` as **BeamConsumerJarPath**.

   ![Configure KDA Application](/images/beam-on-kda/kda-config.png)

1. Expand the **Properties** section and select **Create group**.

1. In the resulting dialog, choose `BeamApplicationProperties` as **Group ID** and add the following three key/value pairs and confirm with **Save**:

   1. `InputStreamName` with the name of the Kinesis stream you've created earlier, ie, `beam-workshop`
   1. `Source` set the source IO for BEAM pipeline to `kinesis` in **lowercase**
   1. `OutputBoroughs` set to `false` as we will not generate borough related information in the streaming BEAM pipeline

   {{% notice info %}}
   We set the `OutputBoroughs` to `false` as the idea is to use the streaming application to just count the number of trips. Then, the if requirements will change we can break this down into by boroughs.
   If we weren’t using Beam we would now need to build another batch application to backfill the new metric for historic data, but now we can just use the same application to backfill the metric for historic data in a batch mode and in streaming mode for new data. Voila, unifying data processing in **B**atch and str**eam**.
   {{% /notice %}}

   ![Configure Property Group](/images/beam-on-kda/kda-prop-grp1.png)

1. Expand the **Snapshots** section and **Disable** snapshots for the application

   {{% notice info %}}
   Enabling snapshots allows the service to maintain the state of a Flink application in case of application updates but also when recovering from infrastructure or application errors. For production environments it is highly desirable to keep snapshots enabled. For development purposes, disabling snapshots allows you to iterate faster, though.
   {{% /notice %}}

1. Expand the **Monitoring** section. Verify that **Task** is set as **Monitoring metrics level** ,  **CloudWatch** logging is enabled, and **Info** is set as the **Monitoring Log Level**.

1. Expand the **Scaling** section. Set the parallelism of the application to `4` and **Disable** automatic scaling.

This determines the [scaling](https://docs.aws.amazon.com/kinesisanalytics/latest/java/how-scaling.html) factor used for the application within Kinesis Data Analytics. Leave the parallelism per KPU as default to 1. To learn more about how Kinesis Data Analytics does scaling see [here](https://docs.aws.amazon.com/kinesisanalytics/latest/java/how-scaling.html).
   <dl>
      <dt>Parallelism</dt>
      <dd>This property to set the default Apache Flink application parallelism. All operators, sources, and sinks execute with this parallelism unless they are overridden in the application code.</dd>
      <dt>ParallelismPerKPU</dt>
      <dd>This property to set the number of parallel tasks that can be scheduled per Kinesis Processing Unit (KPU) of your application. The default is 1, and the maximum is 8. For applications that have blocking operations (for example, I/O), a higher value of ParallelismPerKPU leads to full utilization of KPU resources.</dd>
   </dl>


8. Keep the default settings for **VPC Connectivity** and press the blue **Update** button at the bottom of the page to update the properties of the application. After a few minutes the application will be ready to run.

   ![Configure Complete](/images/beam-on-kda/kda-configure-review.png)
