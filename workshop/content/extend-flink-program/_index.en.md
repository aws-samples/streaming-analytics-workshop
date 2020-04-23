---
title: "Extend the Flink program"
chapter: false
weight: 50
---

In this chapter, we discuss how to extend the existing Flink application. The current version is just echoing the events that are ingested into the data stream. However, the goal is to analyze the incoming information to provide timely insights into the current condition of the taxi fleet. 

You can learn about the required advanced streaming concepts and how they are implemented in Apache Flink from the [Flink documentation](https://ci.apache.org/projects/flink/flink-docs-release-1.9/dev/datastream_api.html). If you are attending an AWS hosted event, we will cover topics like, event time, watermarks, time windows, and processing semantics in a presentation. If you are running the workshop on your own, you can refer to the [Flink documentation](https://ci.apache.org/projects/flink/flink-docs-stable/) and the [online training](https://training.ververica.com/) available from the original creators of Apache Flink to learn more.

In the following, you will learn how to generate statistics about hot spots, ie, places in New York that are currently requesting a high number of taxi trip so that operators can proactively send empty taxis there. You will also see how to derive the average time it takes taxis to the airports La Guardia and JFK. The actual changes have already been implemented in the `ProcessTaxiStream` class that you can already open in Intellij for your reference.

