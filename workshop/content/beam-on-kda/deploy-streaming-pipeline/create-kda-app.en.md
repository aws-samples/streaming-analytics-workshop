---
title: "Create application"
chapter: false
weight: 42
---

You can then execute the Beam pipeline with Amazon Kinesis Data Analytics in a fully managed Apache Flink environment. A Kinesis Analytics application basically consists of a reference to the Flink application in Amazon S3 and some additional configuration data. Once the Kinesis Data Analytics application has been created, it can be deployed and executed by the services in a fully managed environment.

1. Navigate to the [Kinesis Data Analytics Console](https://console.aws.amazon.com/kinesisanalytics) and press **Create application**

1. Enter `beam-workshop` as the **Application name**


1. Select _Apache Flink 1.11_ as the **Runtime**.

1. Choose _Choose from IAM roles that Kinesis Kinesis Analytics can assume_ as **Access permissions**. If you are attending an AWS hosted event, select the only role that is suggested. If you are running the workshop on your own, select the role that contains `KdaRole`.

   ![Create KDA Application](/images/beam-on-kda/kda-create-app.png)

1. Choose *Production* as the **Template for application settings**

1. Create the application by pressing the blue **Create Application** button. This will take you to the overview screen where you will configure further properties of the application.
