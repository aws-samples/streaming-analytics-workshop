---
title: "Create KDA application"
chapter: false
weight: 42
---

You can then create a Flink cluster using Kinesis Analytics for Java application. A Kinesis Analytics for Java application basically consists of a reference to the Flink application in S3 and some additional configuration data. Once the Kinesis Analytics for Java application has been created, it can be deployed and executed by the services in a fully managed environment.

{{% notice tip %}}
It is important that you name the KDA application name as `beam-workshop` as that is used later when analysing the job in AWS CloudWatch.
{{% /notice %}}

1. Navigate to the [Kinesis console](https://console.aws.amazon.com/kinesis/home). Select _Kinesis Data Analytics_ and press **Create application**.

   ![Kinesis Dashboard](/images/beam-on-kda/kinesis-welcome-create-kda.png)

1. Enter `beam-workshop` as the **Application name**

1. Enter a description of the application. e.g. `My BEAM Java Application`

1. Select _Apache Flink 1.8_ as the **Runtime**.

1. Choose _Choose from IAM roles that Kinesis Analytics can assume_ as **Access permissions**. If you are attending an AWS hosted event, select the only role that is suggested. If you are running the workshop on your own, select the role that starts with `beam-workshop-KdaRole....`. In case you need to choose between several roles and wonder which one to select, you can obtain the name of the correct role from the **KinesisAnalyticsServiceRole** output of the CloudFormation template.

   ![Create KDA Application](/images/beam-on-kda/kda-create-app.png)

1. Create the application by pressing the blue **Create Application** button. This will take you to the overview screen where you will configure further properties of the application.

   ![KDA Application Overview](/images/beam-on-kda/kda-create-review.png)
