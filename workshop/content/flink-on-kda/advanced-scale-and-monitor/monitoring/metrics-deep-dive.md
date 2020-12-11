---
title: "Metrics Deep Dive"
chapter: true
weight: 110
---

Let's take a look at the running application using this CloudWatch dashboard and point out potential issues with a given Apache Flink application given these CloudWatch Metrics:

![Dashboard Screenshot](/images/flink-on-kda/advanced-monitoring-index-1-cw-dashboard.png?classes=border,shadow)


# Application Health
#### 1. The Application Health section of this dashboard can help identify fundamental issues with your application that are causing it to be inoperable. Let's start with the first two cells: Uptime and Downtime. 

![Uptime and Downtime](/images/flink-on-kda/advanced-monitoring-cw-1-uptime-and-downtime.png?classes=border,shadow)
In an ideal state, this is exactly how your application should look-- `uptime` measures the cumulative time in milliseconds that the application has been running without interruption. `downtime` would measure the time elapsed during an outage. 
- We have pre-defined an alarm that you can configure whenever downtime > 0ms.
- If you'd like to test this, introduce any sort of bug in the Flink application, and redeploy the application to see how it impacts uptime / downtime.

----------------------------------------------

`Number of Failed Checkpoints` has a similar alarm as `downtime`, with a zero tolerance policy which triggers an alarm after 1 failed checkpoint. This can be configured as well.

`Full Restarts` are a measurement of when the Flink Application has forced a restart due to numerous factors: retry of processing or completing a checkpoint after a failure, out of memory exceptions, etc. Flink will attempt to recover from this failure by restarting automatically. 

{{% notice tip %}} 
Kinesis Data Analytics for Apache Flink will utilize a Restart Strategy with a Fixed Delay and Infinite Retries every 10 seconds upon failure.
{{% /notice %}}


-----------------------------------------------



![Checkpoints](/images/flink-on-kda/advanced-monitoring-cw-2-checkpoint.png?classes=border,shadow)

In an ideal state, both your `lastCheckpointSize` and `lastCheckpointDuration` should remain relatively stable over time. 

{{% notice note %}} 
If you are observing ever-increasing checkpoint size, this can be indicative of state not being cleared within your application, or a memory leak. Similarly with Checkpoint Duration, a longer and unexpected spike in Checkpoint Duration can cause backpressure of your application. Monitor these metrics for stability over time.{{% /notice %}}

--------------------------------------

# Resource Utilization

The resource utilization metrics section gives a glimpse into the resource usage of the running Flink Application. Let's start with CPU and Memory:

![CPU and Memory](/images/flink-on-kda/advanced-monitoring-cw-3-cpumemory.png?classes=border,shadow)

#### CPU 
- In a healthy application, try to keep this metric under 80% usage. 
- This is also the same metric that KDA Flink will utilize to autoscale your application if you have autoscaling enabled. 
- Also note it is completely normal to see CPU spikes during application startup or restart.

#### Heap Memory Utilization
Heap Memory measures the memory taken up by the application, on-heap state (currently being accessed in running application), and any other operations that may take up memory space. This metric _DOES NOT_ measure the RocksDB State Memory utilization, which would be comprised of both on and off-heap memory. That being said, using Heap Memory as a proxy for RocksDB utilization can be an effective indicator of when you need to scale your application.


{{% notice info %}} 
It is not possible to view native memory utilization within CloudWatch Metrics.
{{% /notice %}}

--------------------------------------

#### Thread Count
- It's important to monitor thread count to identify if your application is spinning up needless threads which can clog the network buffers of the running Flink environment. There isn't a set number of active threads that can be running, but it is good to keep an eye on.

#### GC Count and Percent
- The Garbage Collection in an application should be predictable, running periodically to clear out expired state. If these metrics grow much larger or become spiky, it can be an indicator of an unhealthy application.

-----------------------------------------
# Flink Application Progress

![Flink Application Progress CW Metrics](/images/flink-on-kda/advanced-monitoring-cw-4-app-progress.png?classes=border,shadow)

#### Incoming and Outgoing Records Per Second
- These metrics are measured on an application level in this image, but they can also be measued on a task or subtask level for finer granularity and visibility into the operators of your application.
- Ideal state for these would be depending on use case, but if it's just a straight "read, process, write" without filtering of the records, you would expect to see equal amount of records in and out per second.
- If there is some deviation on either end of these metrics, this is a good indicator of where the bottleneck is.
  - If numRecordsInPerSecond is lower, the source might be configured to read in less data, or it could be indicative of backpressure on the sink causing a slowdown.
  - If numRecordsOutPerSecond is lower, it could be identifying a slow operator process in the middle of your application. 



#### Input and Output Watermark + EventTimeLatency.
- The watermarks are indicative of the eventTime with which data is arriving into the datastream. A large difference between these two values could indicate that there is significantly late arriving data into the stream. This should be handled by your stream according to your use case, and EventTimeLatency is a measurement of the total latency, or OutputWatermark - InputWatermark, of the streaming workload.

#### LateRecordsDropped 
This would measure the number of records dropped due to arriving late. If this number is spiking, there is an issue with data arriving late to the Flink application.

-------------------------------------------

# Kinesis Source and Sink Metrics

![Kinesis Source and Sink CW Metrics](/images/flink-on-kda/advanced-monitoring-cw-5-source-and-sink.png?classes=border,shadow)

#### millisBehindLatest
- This metric will showcase the time the consumer is behind the head of the stream, which is a good indicator of how far behind the current time the consumer is. 
  - This metric can be measured on an application or a parallelism level
  - A value of 0 would show that the application is completely caught up with processing records, and this is what is ideal.
  - A higher value means that the application is falling behind, and it could be an indicator that the consumer is not tuned to read records efficiently, backpressure, or some slowness in processing. Scale the application accordingly.

#### RetriesPerRecord, UserRecordsPending, and BufferingTime
- This metric comes from the Kinesis Producer Library, and in this case is referring to our terminal script which is writing to the Kinesis Stream. All applications that use the KPL report this metric, and it is important to monitor in case of frequent retries or timeouts. The other metrics can grow exceedingly large if the Kinesis Data Stream is underprovisioned.


-----------------------------------


{{% notice info %}} 
Try it out! 
{{% /notice %}} 

Make the following modifications to your existing workload and note how these metrics change:
- In the Flink application, modify the Operator parallelism for the source operator. (`.setParallelism(1)`)
- lower the number of shards in the input stream in the Kinesis Console.
- In the Elasticsearch Console (sink), decrease the size of the instance type. 

Write down what you observed for each of these changes of the application to the metrics. 

---------------------------------------


{{%expand "Click to reveal" %}}
### Congrats! You have completed the Advanced Monitoring Section! Continue on to learn how to react to alarms and scale your Kinesis Data Analytics Application efficiently.
.{{% /expand%}}