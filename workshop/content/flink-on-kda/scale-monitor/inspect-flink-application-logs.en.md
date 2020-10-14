---
title: "Inspect Flink application logs"
chapter: false
weight: 30
---

When you were running the Flink program locally in IntelliJ, you could obtain (debug) output directly from the IDE. However, we cannot log in to the infrastructure that runs the KDA application to get access to these logs.

In addition to operational metrics, you can configure the Kinesis Data Analytics application to write messages to CloudWatch Logs. This capability seamlessly integrates with common logging frameworks, such as Apache Log4j and the Simple Logging Facade for Java (SLF4J). So it is useful for debugging and identifying the cause of operational issues.

As you have enabled logging for your Kinesis Data Analytics application, the logs are sent to a CloudWatch Logs stream.

1. On the CloudWatch dashboard, select **Add widget**

1. In the dialog, choose the **Query results** widget and confirm with **Configure**

1. Search for `streaming-analytics-workshop` and select the log stream of the KDA application

	![](/images/flink-on-kda/cw-dashboard-4-configure-log.png)

