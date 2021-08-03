---
title: "Configure Settings"
chapter: false
weight: 32
---

You then set the buffering hints that determine how often Firehose flushes data to the destination

1. Set the **Buffer Interval** to `60` seconds.

	{{% notice info %}}
Amazon Kinesis Data Firehose buffers incoming streaming data to a certain size or for a certain period of time before delivering it to destinations. Buffer size is in MBs and ranges from 1MB to 128MB for Amazon S3 destination Buffer interval is in seconds and ranges from 60 seconds to 900 seconds. Increasing the buffers size allows us to gather data before delivering to ensure all data is delivered to the destination S3 bucket.
{{% /notice %}}

1. Enable **S3 compression** by selecting *GZIP* to optimise the storage of data in Amazon S3. Buffer size is is applied before compression. As a result, if you choose to compress your data, the size of the objects within your S3 bucket can be smaller than the buffer size you specify.

1. Ensure that **Create or update IAM role** is selected, so that Kinesis Data Firehose uses the correct permissions for operations.

1. Leave all other values as default.

1. Select **Next** to move onto the _Review_ screen.

![](/images/beam-on-kda/kfh-configure.png)
