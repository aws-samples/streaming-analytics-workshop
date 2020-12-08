---
title: "Important Flink Metrics"
chapter: true
weight: 90
---

For ease of use and reference, the following metrics will be used for monitoring:
 ##### Application Health
  - `uptime`
  - `downtime`
  - `lastCheckpointSize`
  - `lastCheckpointDuration`
  - `numberOfFailedCheckpoints`
  - `fullRestarts`

##### Resource Utilization
- `cpuUtilization`
- `heapMemoryUtilization`
- `Old Generation GC Count Rate`
- `Old Generation GC Time Percent`
- `threadCount`

##### Flink Application Progress
- `numRecordsInPerSecond`
- `numRecordsOutPerSecond`
- `currentInputWatermark`
- `currentOutputWatermark`
- `Event Time Latency`
- `numLateRecordsDropped`

##### Source and Sink Metrics
- `millisBehindLatest` (Source)
- `RetriesPerRecord` (Sink)
- `UserRecordsPending` (Sink)
- `BufferingTime` (Sink)
