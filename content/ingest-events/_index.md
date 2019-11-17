---
title: "Ingest events"
chapter: true
weight: 30
---

In this chapter, you will create an Kinesis data stream and start ingesting a historic set for taxi trips into the Kinesis stream.

The Kinesis data stream serves as a buffer that decouples the producers from the consumers. Taxis can persist the events that they generate into the data stream regardless of the condition of, for instance, the processing layer, which might be currently recovering from a node failure. 

{{% notice info %}}
IntelliJ will eventually display an error message that the *flink-connector-kinesis* artifact could not be found on Maven central. That is fine for now, we will address it in one of the future steps.
{{% /notice %}}
