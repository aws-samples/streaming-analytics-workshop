---
title: "Extend the Flink program"
chapter: true
weight: 50
---

In this chapter, you extend the existing Flink application. The current version is just echoing the events that are ingested into the data stream. However, the goal is to analyze the incoming information to provide timely insights into the current condition of the taxi fleet. You will extend the existing application to generate statistics about hot spots, ie, places in New York that are currently requesting a high number of taxi trip so that operators can proactively send empty taxis there. You will also implement logic to derive the average time it takes taxis to the airports La Guardia and JFK.

