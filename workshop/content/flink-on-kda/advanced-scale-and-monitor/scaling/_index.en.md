---
title: "Advanced Scaling"
chapter: false
weight: 120
---

## Let's dive deep into how to scale your Kinesis Data Analytics Application based on the previously discussed metrics.

Currently, the only way to scale a Kinesis Data Analytics Application automatically is to use the built-in [Autoscale feature](https://docs.aws.amazon.com/kinesisanalytics/latest/java/how-scaling.html#how-scaling-auto). This feature will monitor your application's CPU usage over time, and if it is above 80% for some period of time, will increase the overall parallelism of your application. There will be downtime experienced during this scale up, and an application developer should take this into account when using the Autoscaling feature.

This is an excellent and useful feature of KDA for Apache Flink, however some applications need to scale based on other factors--not CPU. In this session, we'll take a look at an external way to scale your KDA application based on IncomingRecords or millisBehindLatest metrics on the source Kinesis Data Stream.