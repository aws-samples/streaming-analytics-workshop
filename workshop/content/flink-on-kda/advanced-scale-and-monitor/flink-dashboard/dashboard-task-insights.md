---
title: "Flink Task Level Insights"
chapter: false
weight: 240
---

Let's click on one of the Blue Boxes to see what other information is available to us in the Flink Dashboard.

   ![Click on Window Task](/images/flink-on-kda/click-on-window-box.gif)

   From this side window, we can see much more detailed information regarding our operators that can be helpful for identifying issues with your running Flink application. Lets look at the tabs in more detail.

   {{%expand "Subtasks" %}}

   Click on the tab called `SubTasks` to dive into each of the subtasks of this operator. This will showcase each running subtask within the Blue task box. Since our application should only have a parallelism of `1`, we will only have one running subtask. 

   The primary sign to look for in this view would be any indication of record skew amongst the subtasks. If you had many more records received / sent in one subtask vs. another, this can be indicative of an imbalance of processing which can cause inefficiencies within your flink job, causing one subtask to take longer than its parallel subtasks.

   ![Flink Dashboard Subtasks](/images/flink-on-kda/flink-dashboard-operator-subtasks.png?classes=border,shadow)
   {{% /expand %}}

-----------------------------------



   {{%expand "Task Managers" %}} 
  Click on the tab called `Task Managers` next and let's talk about what may be valuable here. The `Task Managers` tab will showcase the task managers for this specific operator. From the [Flink Architecture](https://ci.apache.org/projects/flink/flink-docs-stable/concepts/flink-architecture.html#anatomy-of-a-flink-cluster) we know that not every task manager will necessarily be running an instance of every task. This has to do with how Flink optimizes its job graph. 

  The primary signs to look for here would be, again, any indication of skew amongst the task managers. This could be a good indicator that either the tasks are being inefficiently chained together or that there is data skew. 

  ![Flink Dashboard Task Managers](/images/flink-on-kda/flink-dashboard-task-managers.png?classes=border,shadow)

   {{% /expand %}}

-----------------------------------



  {{%expand "Watermarks" %}} 
  The Watermarks tab is going to showcase the latest watermark timestamp received by that operator, in other words, the Low Watermark. Where this may be useful is if your application is receiving an influx of late arriving data, the watermarks within each subtask would indicate the lateness and could be an early warning sign of the application falling behind.

   For more details on watermarks, please consult the Flink Documentation on [Event Time](https://ci.apache.org/projects/flink/flink-docs-release-1.12/dev/event_time.html)
  ![Flink Dashboard Watermarks](/images/flink-on-kda/flink-dashboard-watermarks.png?classes=border,shadow)
  {{% /expand %}}

-----------------------------------

   {{%expand "BackPressure" %}}
   The Backpressure tab allows you to sample the operator for indicators of *backpressure*. 

   Essentially, backpressure means that the operator is pushing out data at a slower rate than it can accept data in. To handle this, Flink will gradually slow down upstream operators to account for the slow processing rate of the backpressured operator.

   Backpressure can occur for any number of reasons:
   - Underprovisioned KPU's for the load on the application
   - Job failures, Null Pointer Exceptions, which lead to restarts
   - Bad practice of logging within the application--logging on every message or frequently enough to slow processing down
   - Underprovisioned Sinks (not enough shards, partitions, too slow at responding back)
   - Unoptimized code for streaming
   - Long Checkpointing Times

This section of the Flink Dashboard can run a measurement to identify if backpressure is being applied on this specific operator, and will return results within a few seconds of opening. This is a great place to look if you suspect your application is experiencing backpressure.
![Flink Dashboard Backpressure](/images/flink-on-kda/flink-dashboard-backpressure.png?classes=shadow,border)

   {{% /expand %}}

-----------------------------------

   {{%expand "Metrics" %}}

  As stated in the Job Level metrics, The **Metrics** tab showcases many of the same metrics that would otherwise be available within CloudWatch metrics for Kinesis Data Analytics for Apache Flink jobs. 

The primary benefit to the metrics being made available in the Flink Dashboard would be higher granularity: It can sometimes be helpful to enable Parallelism level metrics on for Kinesis Data Analytics application, however this can come at a higher incurred cost for CloudWatch logs being generated at a higher volume. The Flink Dashboard metrics give you this granularity out of the box. This being said, keep in mind that these metrics and any views that are generated are strictly `temporal`. As soon as the page is reloaded, these metrics and views will disappear. You cannot alert off of these metrics, and they should only be used for debugging purposes.

For most cases, these metrics will not be necessary to use for troubleshooting, but some metrics may be useful depending on your application. A full list of metrics and their usability for debugging purposes can be found [here](https://ci.apache.org/projects/flink/flink-docs-stable/ops/metrics.html#system-metrics).
   {{% /expand %}}


