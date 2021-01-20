---
title: "Troubleshooting Using the Flink Web Dashboard"
chapter: false
weight: 220
---

#### Prefacing this section: 
This will not be a comprehensive overview of how to troubleshoot your Apache Flink application using the Flink Web Dashboard, but will rather attempt to cover common areas that can be indicative of issues within an application which are visible from within the Flink Web Dashboard.


In this section, we will cover some basics of navigating around your application's dashboard page, how to identify issues and what they mean.

1. From the main screen on the Flink Web Dashboard, click onto your running application in the Running Job List. 
2. This will open a screen with a Directed Acyclic Graph similar to the one available on the Kinesis Data Analytics for Apache Flink Application page.
3. On this screen, we can already access a lot of information about our running jobs:
   
   ### Directed Acyclic Graph 
   The **Blue Boxes** with arrows pointing to the right is known as the `Directed Acyclic Graph (DAG)` of your running Apache Flink job. This DAG represents the flow of data throughout each of the operators of your application. Each blue box consists of a series of chained operators (tasks) on a single task slot. Each individual subtask is executed by a single thread on a task manager, and they can be chained together for optimal performance. 
   Wide transformations or explicit disabling of chaining forces the task to hand its data off to the next blue box to continue on the data processing. Things like joins, rebalances, and window functions can cause the chains to break, but it really depends on the Flink optimizer to make this determination.

   ![Web Dashboard Tasks](/images/flink-on-kda/flink-web-dashboard-tasks.png)


   Keep in mind, we are not seeing the full picture of this application from this directed acyclic graph. Notice the `Parallelism` at the bottom of each blue box. When you scale your application like we did in the previous exercise, you can imagine the parallelism multiplying the number of blue boxes for that specific task. It would look something like this, pulled apart:

   ![Parallel Data Flow Flink](/images/flink-on-kda/parallel-data-flow-flink.png)
    - Source: https://ci.apache.org/projects/flink/flink-docs-release-1.12/concepts/flink-architecture.html

   This image showcases an application with a `Source Operator` sending data to a `Map Operator`. These operators are chained together into a single task, but they each have a `parallelism` of `2`. This is why you see two copies of the same operaton. 

   Next we see data from this task being sent to a `keyBy()` -> `window()` -> `apply()` task, which also has a parallelism factor of `2`.

   Finally, this data is sent to the `Sink()` operator which has an explicit parallelism of `1`, which is why you only see one yellow box represented here. 


   ------------------------------------

   Within this same main screen, let's direct our attention to the lower third of the dashboard. Here we can see the status of each of our tasks, as well as the Bytes Received, Bytes Sent, Records Received and Records Sent. Scrolling to the right a bit you can also see the tasks total running duration. These may differ between tasks if your application needs to restart one of the tasks for whatever reason.

   ![Dashboard Task List](/images/flink-on-kda/flink-web-dashboard-task-list.png)



   {{% notice info %}} 
   Flink can only measure the bytes sent / bytes received between operators. This is why you won't see these metrics for a source or sink operator, because the data is coming from outside of Flink.
   {{% /notice %}}

