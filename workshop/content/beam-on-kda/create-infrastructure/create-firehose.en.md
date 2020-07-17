---
title: "Create a Kinesis Firehose"
chapter: false
weight: 11
---

Next you create a Kinesis Firehose to allow for transforming and enrichment of the source data to eventually store into an S3 bucket. Here is where we attach to the Kinesis data stream created earlier and apply Lambda functions that are pre-created for the lab. The transformed data will be put into an S3 bucket that is also pre-created.

The Lambda function and destination S3 bucket are pre-created for you via cloud formation. Browse to [Cloud Formation](https://aws.amazon.com/cloudformation/) from the services menu and select the stack labelled `beam-workshop` and browse to the `Outputs` section to see the resources that will be used in this section.

![](/images/kfh-cf.png)

{{% notice info %}}
The Lambda transform `beam-workshop-EnrichEventsLambda...` is adding the approximate arrival timestamp into the payload of the message when it is written to s3. This is so we can get the same result for the batch and streaming pipeline as both referring to the same data point.
{{% /notice %}}

Browse to the resources section in your beam-workshop stack and select the Lambda function to see the code in detail.

![](/images/kfh-lambda.png)

Follow the below steps to create the Kinesis Firehose Delviery Stream

1. Navigate to the [Kinesis Console](https://console.aws.amazon.com/kinesis)

1. If displayed, up press **Get Started** in the service welcome dialog

1. Select **Kinesis Data Firehose**

1. Select **Create delivery stream** to navigate to the Amazon Kinesis Firehose Stream service:

   ![](/images/kfh-create.png)

#### Step 1 - Name and Source

1. Choose `beam-workshop-s3` as **Delivery Stream name**

1. Choose the source as `Kinesis Data Stream`

1. In the drop down select `beam-workshop` as the Kinesis data stream source

1. Select **Next** to move onto the _Process Records_ screen.

   ![](/images/kfh-selectsources3.png)

#### Step 2 - Process Records

In this secton we will attach the Lambda function to process the records

1. Select **Enabled** under `Data transformation`

1. Select the Lambda function that begins with `beam-workshop-EnrichEventLambda...`

1. Leave the `Record Format Conversion` as **Disabled**

1. Select **Next** to move onto the _Choose a destination_ screen.

![](/images/kfh-process.png)

#### Step 3 - Choose a Destination

In this section we pick the destination for the transformed records.

1. Select `Amazon S3` as the Desitnation type

1. For the S3 Bucket name select the pre-created S3 bucket shown above in your account from the drop down, `beam-workshop-bucket....`

1. For Prefix enter `historic-trip-events/` so that all the trasnformed records are easily identifiable in s3

1. Leave all options as default i.e. `Disable S3 Backup`

1. Select **Next** to move onto the _Configure Settings_ screen.

![](/images/kfh-s3.png)

#### Step 4 - Configure Settings

In this section we configure the Firehose stream.

1. Set the `Buffer Interval` to **60 seconds**.

{{% notice info %}}
Amazon Kinesis Data Firehose buffers incoming streaming data to a certain size or for a certain period of time before delivering it to destinations. Buffer size is in MBs and ranges from 1MB to 128MB for Amazon S3 destination Buffer interval is in seconds and ranges from 60 seconds to 900 seconds. Increasing the buffers size allows us to gather data before delivering to ensure all data is delivered to the destination S3 bucket.
{{% /notice %}}

1. Enable `S3 compression` to **GZIP** to optimise the storage of S3 data. Buffer size is is applied before compression. As a result, if you choose to compress your data, the size of the objects within your Amazon S3 bucket can be smaller than the buffer size you specify.

1. Ensure that created `IAM Role` is selected i.e. **KinesisFirehoseServiceRole-beam-workshop-eu-west-1-...**, so that Kinesis Data Firehose uses the correct permissions for operations.

1. Leave all other valeues as default.

1. Select **Next** to move onto the _Review_ screen.

![](/images/kfh-configure.png)

#### Step 5 - Review Settings

Once you have checked all the settings select **Create delivery stream** to create the Firehose Delivery Stream.

![](/images/kfh-review.png)

After a few minutes you will see a Firehose Delivery Stream called `beam-workshop-s3` created on the Kinesis Dashboard. Click on the stream name to see more details and use this page to monitor activity in the later stages.

![](/images/kfh-check.png)

![](/images/kfh-check2.png)

You are now ready to move to the next stage where replay data into these infrastructure components.
