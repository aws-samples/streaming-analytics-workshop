---
title: "Create a Firehose delivery stream"
chapter: false
weight: 32
---

Next you create an Amazon Kinesis Data Firehose delivery stream to allow for transforming and enrichment of the source data to eventually store into an S3 bucket. The delivery stream will consume data from the data stream that has been created earlier. The delivery stream also enriches the events that are persisted to Amazon S3 by means of an AWS Lambda function that has already been pre-created for the lab.

Each event that is persisted in the Kinesis stream is automatically assigned an *approximate arrival timestamp* in the event meta data. The Lambda function is simply adding the *approximate arrival timestamp* from the meta data into the payload of the message when it is written to Amazon S3.

```js
function enrichPayload(record) {
    const payload = JSON.parse(Buffer.from(record.data, 'base64').toString('utf8'));
    const timestamp = new Date(record.kinesisRecordMetadata.approximateArrivalTimestamp).toISOString();
    
    const enrichedPayload = Object.assign({approximate_arrival_timestamp: timestamp}, payload);

    return Buffer.from(JSON.stringify(enrichedPayload)+"\n").toString('base64');
}
```

In this way, the streaming and the batch pipeline can refer to the same timestamp so we can get the same result for the batch and streaming pipeline. Follow the below steps to create the delivery stream.

#### Step 1 - Name and Source

1. Navigate to the [Amazon Kinesis Data Firehose console](https://console.aws.amazon.com/firehose) and select **Create delivery stream**

1. Choose `beam-workshop-s3` as **Delivery Stream name**

1. Select *Kinesis Data Stream* as the **Source**

1. In the drop down select `beam-workshop` as the Kinesis data stream source

1. Select **Next** to move onto the _Process Records_ screen.

   ![](/images/beam-on-kda/kfh-selectsources3.png)

#### Step 2 - Process Records

In this section we will attach the Lambda function to process the records

1. Select *Enabled* under **Data transformation**

1. In the dropdown for **Lambda function**, select the Lambda function whose name contains `EnrichEventsLambda`

1. Leave the **Record Format Conversion** as **Disabled**

1. Select **Next** to move onto the _Choose a destination_ screen.

![](/images/beam-on-kda/kfh-process.png)

#### Step 3 - Choose a Destination

In this section we pick the destination for the transformed records.

1. Select **Amazon S3** as the Destination type

1. For the S3 Bucket name select the pre-created S3 bucket whose name contains `historictrips`

1. For **Prefix** enter `historic-trip-events/` so that all the transformed records are easily identifiable in Amazon S3

1. Leave all other options as default

1. Select **Next** to move onto the _Configure Settings_ screen.

![](/images/beam-on-kda/kfh-s3.png)

#### Step 4 - Configure Settings

In this section we configure the Firehose stream.

1. Set the **Buffer Interval** to `60` seconds.

	{{% notice info %}}
Amazon Kinesis Data Firehose buffers incoming streaming data to a certain size or for a certain period of time before delivering it to destinations. Buffer size is in MBs and ranges from 1MB to 128MB for Amazon S3 destination Buffer interval is in seconds and ranges from 60 seconds to 900 seconds. Increasing the buffers size allows us to gather data before delivering to ensure all data is delivered to the destination S3 bucket.
{{% /notice %}}

1. Enable **S3 compression** by selecting *GZIP* to optimise the storage of data in Amazon S3. Buffer size is is applied before compression. As a result, if you choose to compress your data, the size of the objects within your S3 bucket can be smaller than the buffer size you specify.

1. Ensure that **Created or update IAM Role** is selected, so that Kinesis Data Firehose uses the correct permissions for operations.

1. Leave all other values as default.

1. Select **Next** to move onto the _Review_ screen.

![](/images/beam-on-kda/kfh-configure.png)

#### Step 5 - Review Settings

Once you have checked all the settings select **Create delivery stream** to create the Firehose Delivery Stream. After a few minutes you will see a Firehose Delivery Stream called `beam-workshop-s3` created on the Kinesis Dashboard. Click on the stream name to see more details and use this page to monitor activity in the later stages.

![](/images/beam-on-kda/kfh-check.png)

You are now ready to move to the next stage where replay data into these infrastructure components.
