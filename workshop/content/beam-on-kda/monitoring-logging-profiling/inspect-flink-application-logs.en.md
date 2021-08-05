---
title: "Inspect Flink application logs"
chapter: false
weight: 72
---

In addition to operational metrics, you can configure the Kinesis Data Analytics application to write messages to CloudWatch Logs. This capability seamlessly integrates with common logging frameworks, such as Apache Log4j and the Simple Logging Facade for Java (SLF4J). So it is useful for debugging and identifying the cause of operational issues.

As you have enabled logging for your Kinesis Data Analytics application, the logs are sent to a CloudWatch Logs stream. The dashboard already contains a widget to display errors from these logs. You will now add a widget that queries and displays the complete log messages.

1. On the CloudWatch dashboard, select **Add widget**

1. In the dialog, choose the **Logs table** widget and confirm with **Configure**

1. Search for `beam-workshop` and select the log stream of the KDA application named as: `aws/kinesis-analytics/beam-workshop`

  ![](/images/beam-on-kda/cw-dashboard-4-configure-log.png)

You will now have two additional widgets in your dashboard:

  ![](/images/beam-on-kda/cw-dashboard-6-log-result.png)
