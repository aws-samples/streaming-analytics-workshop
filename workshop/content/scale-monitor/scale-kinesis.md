---
title: "Scale the Kinesis stream"
chapter: false
weight: 10
---

When you closely inspect the output of the producer application, you will notice that it is experiencing write provisioned throughput exceeded exceptions and cannot send data fast enough. For the purpose of the workshop, the Kinesis data stream has been deliberately under provisioned. As this would be a major problem for production environments, you'll now scale the stream to increase its capacity.

![](/images/intellij-13-replay-lag-copy.png)

1. Navigate to the Kinesis console and select the *streaming-analytics-workshop* data stream on the dashboard

1. Under **Shards** choose **Edit** and increase the shard count of the stream to `16`. Confirm with **Save**.

	![](/images/kds-update-shards.png)

1. The scaling operation will add additional shard to the Kinesis stream, effectively doubling its throughput
