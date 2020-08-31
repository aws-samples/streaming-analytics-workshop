---
title: "Create a Kinesis data stream"
chapter: false
weight: 31
---

You start with creating a Kinesis data stream.

1. Navigate to the [Kinesis Console](https://console.aws.amazon.com/kinesis)

1. If displayed, up press **Get Started** in the service welcome dialog

1. Select **Create data stream** to navigate to the Amazon Kinesis Data Stream service:
   ![](/images/beam-on-kda/kinesis-welcome-create-stream.png)

1. Choose `beam-workshop` as **Kinesis stream name**

1. Enter `4` as the **Number of shards**.

   {{% notice info %}}
   A Shard is the base throughput unit of an Amazon Kinesis data stream. One shard provides a capacity of 1MB/sec data input and 2MB/sec data output. One shard can support up to 1000 PUT records per second. You will specify the number of shards needed when you create a data stream. For example, we create a data stream with four shards. This data stream has a throughput of 4MB/sec data input and 8MB/sec data output, and allows up to 4000 put records per second. You can monitor shard-level metrics in Amazon Kinesis Data Streams and add or remove shards from your data stream dynamically as your data throughput changes by resharding the data stream.
   {{% /notice %}}

1. Select **Create Kinesis stream** at the bottom of the page
   ![](/images/beam-on-kda/kds-create-stream.png)

1. After a few moments, the data stream should have been created successfully and be in an _Active_ state
   ![](/images/beam-on-kda/kds-create-stream-active.png)

1. We are now ready to create the Firehose delivery stream.
