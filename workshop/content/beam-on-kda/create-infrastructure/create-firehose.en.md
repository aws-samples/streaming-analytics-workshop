---
title: "Create a Kinesis Firehose"
chapter: false
weight: 11
---

Next you create a Kinesis Firehose to allow for transforming and enrichment of the source data to eventually store into an S3 bucket. Here is where we attach to the Kinesis data stream created earlier and apply Lambda functions that are pre-created for the lab. The transformed data will be put into an S3 bucket that is also pre-created.

1. Navigate to the [Kinesis Console](https://console.aws.amazon.com/kinesis)

1. If displayed, up press **Get Started** in the service welcome dialog

1. Select **Kinesis Data Firehose**

1. Select **Create delivery stream** to navigate to the Amazon Kinesis Firehose Stream service:
   ![](/images/kfh-create.png)

1. Choose `s3-beam-workshop` as **Delievert Stream name**

1. Choose the source as **Kinesis Data Stream**

1. In the drop down select **beam-workshop** as the Kinesis data stream source

1. Select **Next** to move ontp the _Process Records_ screen.

   ![](/images/kfh-selectsource.png)

1. ADD Source from CFOrmation - TBD
