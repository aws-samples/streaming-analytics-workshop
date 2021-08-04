---
title: "Deploy Streaming Pipeline"
menuTitle: "Deploy Streaming Pipeline"
chapter: false
weight: 40
---

In this chapter you will compile the Beam pipeline to a Jar file. The Beam pipeline is configured with the Apache Flink Runner, so that it can be executed with Kinesis Data Analytics in a managed Apache Flink environment. You will then create a Kinesis Data Analytics application and execute the Beam pipeline so that it populates an [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) dashboard with the total number of taxi trips made in NYC in a certain time interval.

One the application is producing output, you will change the output of the Beam pipeline to generate more fine grained metrics on the number of trips per borough.
