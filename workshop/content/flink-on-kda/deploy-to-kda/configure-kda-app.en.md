---
title: "Configure KDA application"
chapter: false
weight: 50
---

The skeleton of the application has now been created. But you still need to adapt important configuration options, including the location of the Jar file on S3, the name of the Kinesis data stream to read from, and the Elasticsearch endpoint.

1. On the resulting page press the blue **Configure** button to configure the Kinesis Analytics application.

1. Enter the bucket and prefix of the compiled jar file under **Amazon S3 bucket** and **Path to Amazon S3 object**. You can obtain the correct values from the Output section of the CloudFormation template under **FlinkApplicationJarBucket** and **FlinkApplicationJarObject**.

	![Configure KDA Application](/images/kda-configure.png)

1. Expand the **Properties** section and select **Create group**. 

1. In the resulting dialog, choose `FlinkApplicationProperties` as **Group ID** and add the following two key/value pairs and confirm with **Save**:
	1. `InputStreamName` with the name of the Kinesis stream you've created earlier, eg, `streaming-analytics-workshop`
	1. `ElasticsearchEndpoint` with the Elasticsearch https endpoint you have noted earlier

	![Configure Property Group](/images/kda-property-group.png)

1. Expand the **Snapshots** section and **Disable** snapshots for the application
	{{% notice info %}}
Enabling snapshots allows the service to maintain the state of a Flink application in case of application updates but also when recovering from infrastructure or application errors. So for production environments it is highly desirable to keep snapshots enabled.
	{{% /notice %}}

1. Expand the **Monitoring** section. Select **Task** as **Monitoring metrics level** and enable **CloudWatch** logging.

	![Configure Monitoring](/images/kda-monitoring.png)

1. Keep the default settings for **Scaling** and **VPC Connectivity** and press the blue **Update** button at the bottom of the page to update the properties of the application
