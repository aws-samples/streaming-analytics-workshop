---
title: "Troubleshooting Using the Flink Web Dashboard"
chapter: false
weight: 220
---

#### Prefacing this section: 
This will not be a comprehensive overview of how to troubleshoot your Apache Flink application using the Flink Web Dashboard, but will rather attempt to cover common areas that can be indicative of issues within an application which are visible from within the Flink Web Dashboard.


In this section, we will cover some basics of navigating around your application's dashboard page, how to identify issues and what they mean.

### Steps to write:
- Click into running streaming job
- Look at DAG and talk about each of the components: 
  - parallelism
  - chained operators
- Status of the operators
- Bytes/Records Received (+ Source)
- Bytes/Records Sent (+ Sink)
- Click on the Window operator
  - Subtasks
    - Look for skew in records received / sent
  - Task Managers
    - You can see this has two parallel subtasks running on two task managers
  - Watermarks
    - Check that the watermarks in each subtask are not varying wildly
 - Backpressure
     - You can actively monitor backpressure in each operator! Let the measurement run
 - Flink Metrics:
   - Ones to look for:
     - ?? (ask steffen, hari or karthi, most look the same as what is available in CW)

- Exceptions Tab
- Checkpoints Tab
  - Ensure checkpoints are not growing, look at skew of checkpoints for operators and note the size



Next page! :)