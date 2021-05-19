---
title: "Introduction"
chapter: false
weight: 10
---

We use a scenario to analyze the telemetry data of a taxi fleet in New York City in near real-time to optimize the fleet operation. 

In this scenario, every taxi in the fleet is capturing information about completed trips. The tracked information includes the pickup and drop-off locations, number of passengers, and generated revenue. This information is produced into a Kinesis data stream as a simple JSON blob.

From there, the data is processed and analyzed to identify areas that are currently requesting a high number of taxi rides. The derived insights are finally visualized in a dashboard for operators to inspect.

![Architecture](/images/flink-on-kda/workshop-architecture.png)

Throughout the course of this workshop, you will build a fully managed infrastructure that can analyze the data in near-time, ie, within seconds, while being scalable and highly available. The architecture will leverage Amazon Kinesis Data Stream as a streaming store, [Amazon Kinesis Data Analytics](https://aws.amazon.com/kinesis/data-analytics/) to run an [Apache Flink](https://flink.apache.org) application in a fully managed environment, and [Amazon Elasticsearch Service](https://aws.amazon.com/elasticsearch-service/) and [Kibana](https://aws.amazon.com/elasticsearch-service/the-elk-stack/kibana/) for visualization.

Along the way, we will learn about basic Flink concepts and common patterns for streaming analytics. We will also cover how KDA for Apache Flink is different from a self-managed environment and how to effectively operate and monitor streaming architectures.
