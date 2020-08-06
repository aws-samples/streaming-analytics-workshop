---
title: "Scale the Kinesis stream"
chapter: false
weight: 10
---

When you closely inspect the output of the producer application, you will notice that it is experiencing write provisioned throughput exceeded exceptions and cannot send data fast enough. For the purpose of the workshop, the Kinesis data stream has been deliberately under provisioned. As this would be a major problem for production environments, you'll now scale the stream to increase its capacity.

![](/images/flink-on-kda/intellij-13-replay-lag-copy.png)

1. Go to the [Kinesis Data Streams console](https://console.aws.amazon.com/kinesis/home#/streams/list) and click on the *streaming-analytics-workshop* data stream

1. Navigate to the **Configuration** tab and choose **Edit** under **Stream capacity**

	![](/images/flink-on-kda/kds-update-shards.png)

1. In the resulting dialog, change the *Number of open shards* to `16` and confirm with **Save changes**

1. The scaling operation will add additional shard to the Kinesis stream, effectively doubling its throughput
