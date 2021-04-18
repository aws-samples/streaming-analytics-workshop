---
title: "Configure KDA application"
chapter: false
weight: 50
---

The skeleton of the application has now been created. But you still need to adapt important configuration options, including the location of the Jar file on S3, the name of the Kinesis data stream to read from, and the Elasticsearch endpoint.

1. On the resulting page press the blue **Configure** button to configure the Kinesis Analytics application.

1. Enter the bucket and prefix of the compiled jar file under **Amazon S3 bucket** and **Path to Amazon S3 object**. You can obtain the correct values from the Output section of the CloudFormation template under **FlinkApplicationJarBucket** and **FlinkApplicationJarObject**.

	![Configure KDA Application](/images/flink-on-kda/kda-configure.png)

1. Expand the **Properties** section and select **Create group**. 

1. In the resulting dialog, choose `FlinkApplicationProperties` as **Group ID** and add the following two key/value pairs and confirm with **Save**:
	1. `InputStreamName` with the name of the Kinesis stream you've created earlier, eg, `streaming-analytics-workshop`
	1. `ElasticsearchEndpoint` with the Elasticsearch https endpoint you have noted earlier

	![Configure Property Group](/images/flink-on-kda/kda-property-group.png)

1. Expand the **Monitoring** section and verify that **Task** is selected as **Monitoring metrics level** and **CloudWatch logging** is eneabled.

	![Configure Monitoring](/images/flink-on-kda/kda-monitoring.png)

1. Expand the **Scaling** section and reduce the **Parallelism** to `1`

	![Configure Scaling](/images/flink-on-kda/kda-configure-scaling.png)

1. Keep the default settings **VPC Connectivity** and press the blue **Update** button at the bottom of the page to update the properties of the application
