---
title: "(Auto)scale the Flink application"
chapter: false
weight: 40
---

As you have increased the throughput of the Kinesis stream by doubling the number of shards, more events are sent into the stream. However, as a direct result, more events need to be processed. So now the Kinesis Data Analytics application becomes overloaded and can no longer keep up with the increased number of incoming events. You can observe this through the millisBehindLatest metric, which is published to CloudWatch.

In contrast to Kinesis Data Streams, Kinesis Data Analytics natively supports auto scaling. After 10-15 minutes, you can see the effect of the scaling activities in the metrics. The millisBehindLatest metric starts to decrease until it reaches zero, when the processing has caught up with the tip of the Kinesis data stream.

![](/images/flink-on-kda/cw-dashboard-6-scale-kda.png)

Notice how the millisBehindLatest metric spikes just before it starts to decline. This is caused by the way that scaling a Kinesis Data Analytics application works today. To scale a running application, the internal state of the application is persisted into a so-called savepoint. This savepoint is exposed as a snapshot by Kinesis Data Analytics. Subsequently, the running instance of the application is terminated, and a new instance of the same application with more resources and a higher parallelism is created. The new instance of the application then populates its internal state from the snapshot and resumes the processing from where the now terminated instance left off.

The KDA application takes 10-15 minutes to scale; if it hasn't scaled yet, you can scale it manually.

1. Navigate to the Kinesis Data Analytics application. Under **Scalin** adapt the **Parallelism** to 2 and confirm the operation with **Update**.

	![](/images/flink-on-kda/kda-scale-app.png)
