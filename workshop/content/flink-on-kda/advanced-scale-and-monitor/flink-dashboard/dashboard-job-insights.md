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

![Flink Dashboard Exceptions](/images/flink-on-kda/flink-dashboard-exception-tab.png)



# Checkpoints Tab
## Content

### Steps to write:

 - Flink Metrics:
   - Ones to look for:
     - ?? (ask steffen, hari or karthi, most look the same as what is available in CW)

- Exceptions Tab
- Checkpoints Tab
  - Ensure checkpoints are not growing, look at skew of checkpoints for operators and note the size



Next page! :)