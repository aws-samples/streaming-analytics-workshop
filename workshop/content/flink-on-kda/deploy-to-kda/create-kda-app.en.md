---
title: "Create KDA application"
chapter: false
weight: 40
---

You can then create the Kinesis Analytics application. A Kinesis Analytics for Java application basically consists of a reference to the Flink application in S3 and some additional configuration data. Once the Kinesis Analytics for Java application has been created, it can be deployed and executed by the services in a fully managed environment.

1. Navigate to the [Kinesis console](https://console.aws.amazon.com/kinesis/home). Select *Kinesis Data Analytics* and press **Create application**. 

	![Kinesis Dashboard](/images/flink-on-kda/kinesis-welcome-create-kda.png)

1. Enter `streaming-analytics-workshop` as the **Application name** and select *Apache Flink 1.11* as the **Runtime**. 

	![Create KDA Application](/images/flink-on-kda/kda-create-app.png)

1. Choose *Choose from IAM roles that Kinesis Analytics can assume* as **Access permissions**. If you are attending an AWS hosted event, select the only role that is suggested. If you are running the workshop on your own, select the role that starts with `streaming-analytics-workshop`. In case you need to choose between several roles and wonder which one to select, you can obtain the name of the correct role from the **KinesisAnalyticsServiceRole** output of the CloudFormation template.

	![Create KDA Application](/images/flink-on-kda/kda-create-app-permissions.png)

1. Create the application by pressing the blue **Create Application** button
