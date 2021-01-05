---
title: "Flink Job Level Insights"
chapter: false
weight: 230
---

Let's click on the top level tabs to see what each of them show. These tabs can be found on the top level of the main job view, just below the job name and high level information.

![Flink Web Dashboard Top Level Tabs](/images/flink-on-kda/flink-web-dashboard-top-level-tabs.png?classes=border,shadow)

Follow along as we review each of them for information.


# Exceptions Tab
The Flink Exception Tab will showcase exceptions that bubble up to the Job Manager from the Task Managers. An exception here indicates that the job needed to restart completely due to this exception. While it is a good place to look for reasons the job is slow / crashing, looking at task manager logs can often give better insights.

![Flink Dashboard Exceptions](/images/flink-on-kda/flink-dashboard-exception.png)


-------------------


# Checkpoints Tab
The checkpoints tab will give higher level insights into the checkpoints being taken by your Kinesis Data Analytics for Apache Flink application. 

By default, Checkpoints are turned on in your application, and you can see the default settings [here](https://docs.aws.amazon.com/kinesisanalytics/latest/java/reference-flink-settings.title.html#reference-defaults-checkpoint). The Checkpointing Mode is set to `Exactly Once` and the application is configured by default to take checkpoints once every minute. Given that, what can we glean from the Flink Dashboard Checkpoint page?

## Checkpoints Overview
![Flink Dashboard Checkpoints Tab](/images/flink-on-kda/flink-dashboard-checkpoints-tab.png)

From the overview page, we can see a running count of all checkpoints which have been triggered, completed, if there are checkpoints in progress, or failing.

A failing checkpoint can be indicative of a larger problem within your Flink applicaiton like a checkpoint being too large, coding issues or null pointer exceptions, or misconfigured sources / sinks / network connectivity. These errors will be visible within the Exception tab discussed previously or within CloudWatch metrics.

We also have fine-grained visibility into the checkpoint size for each operator. This can be extremely useful to see if an operator is generating unnecessarily large state. 


## Checkpoints History

On the history tab we can see some history of the past checkpoints that have been captured throughout the Flink Application's runtime.

![Checkpoint History](/images/flink-on-kda/flink-dashboard-checkpoint-history.png?classes=border,shadow)

{{% notice tip %}} 
Pay close attention to checkpoint size over time to ensure that the checkpoint size is not increasing over time. This can indicate that state is not getting cleared. Dealing with state should most often be done using higher-level Flink operators and [StateTTLConfig](https://flink.apache.org/2019/05/19/state-ttl.html) to explicitly clear state.
   {{% /notice %}}


------------------------------

#### Summary
The **Summary** tab can be useful for seeing if there is any large variance to the checkpoint size or duration, as it showcases the Minimum, Average and Maximum Duration and Checkpoint Size.

#### Configuration
The Configuration tab will showcase the current checkpoint configuration set in your application. You can utilize the Configuration tab to ensure that the settings you have set through the AWS CLI have properly taken effect within your job. Otherwise, these values will be the defaults specified [here](https://docs.aws.amazon.com/kinesisanalytics/latest/java/reference-flink-settings.title.html#reference-defaults-checkpoint).


#### Metrics
The **Metrics** tab showcases many of the same metrics that would otherwise be available within CloudWatch metrics for Kinesis Data Analytics for Apache Flink jobs. 

The primary benefit to the metrics being made available in the Flink Dashboard would be higher granularity: It can sometimes be helpful to enable Parallelism level metrics on for Kinesis Data Analytics application, however this can come at a higher incurred cost for CloudWatch logs being generated at a higher volume. The Flink Dashboard metrics give you this granularity out of the box. This being said, keep in mind that these metrics and any views that are generated are strictly `temporal`. As soon as the page is reloaded, these metrics and views will disappear. You cannot alert off of these metrics, and they should only be used for debugging purposes.

For most cases, these metrics will not be necessary to use for troubleshooting, but some metrics may be useful depending on your application. A full list of metrics and their usability for debugging purposes can be found [here](https://ci.apache.org/projects/flink/flink-docs-stable/ops/metrics.html#system-metrics).