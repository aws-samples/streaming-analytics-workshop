---
title: "Important Flink Metrics"
chapter: true
weight: 90
---

For ease of use and reference, the following metrics will be used for monitoring:

{{%expand "Application Health" %}}

| Metric Name | Definition |
| :----------| :---------|
| `uptime`             |  The time that the job has been running without interruption (ms)|
| `downtime`            |  For jobs currently in a failing/recovering situation, the time elapsed during this outage. (ms) |
| `lastCheckpointSize`  | The total size of the last checkpoint	(bytes)           |
| `lastCheckpointDuration` | The time it took to complete the last checkpoint	(ms)        |
| `numberOfFailedCheckpoints`| The number of times checkpointing has failed.	            |
| `fullRestarts`         | The total number of times this job has fully restarted since it was submitted.  |

.{{% /expand%}}


{{%expand "Resource Utilization" %}} 

| Metric Name | Definition |
| :----------| :---------|
| `cpuUtilization`             |  Overall percentage of CPU utilization across task managers.	|
| `heapMemoryUtilization`      |  Overall heap memory utilization across task managers.     	 |
| `Old Generation GC Count Rate`  | The rate of old garbage collection operations. (over 1m)   |
| `Old Generation GC Time Percent` | The percent time spent performing old garbage collection operations.	(over 1m)    |
| `threadCount`| The total number of live threads used by the application.		            |

.{{% /expand%}}

{{%expand "Flink Application Progress" %}} 

| Metric Name | Definition |
| :----------| :---------|
| `numRecordsInPerSecond`         |  The total number of records this operator or task has received per second.		|
| `numRecordsOutPerSecond`     |  The total number of records this operator or task has emitted per second.	     	 |
| `currentInputWatermark` | The last watermark this application/operator/task/thread has **received**	   |
| `currentOutputWatermark` | The last watermark this application/operator/task/thread has **emitted**	    |
| `Event Time Latency`| `currentOutputWatermark` - `currentInputWatermark`            |
| `numLateRecordsDropped` | The number of records this operator or task has dropped due to arriving late. |

.{{% /expand%}}

{{%expand "Kinesis Source and Sink Metrics" %}} 

| Metric Name | Definition |
| :----------| :---------|
| `millisBehindLatest` (Kinesis Source)       |  The number of milliseconds the consumer is behind the head of the stream, indicating how far behind current time the consumer is. 		|
| `RetriesPerRecord` (Kinesis Producer Library)    |  Number of retries performed per user record. Zero is emitted for records that succeed in one try.	     	 |
| `UserRecordsPending` (Kinesis Producer Library)  | Periodic sample of how many user records are currently pending. A record is pending if it is either currently buffered and waiting for to be sent, or sent and in-flight to the backend service.   |
| `BufferingTime`  (Kinesis Producer Library) | The time between a user record arriving at the KPL and leaving for the backend.  |

.{{% /expand%}}

