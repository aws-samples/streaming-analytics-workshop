---
title: "Ingest events"
chapter: false
weight: 35
---

This chapter focusses on the ingestion part of the architecture. You first create a Kinesis data stream, which serves as a short term streaming store for the events that are created by the taxi fleet. You then start producing a historic set of taxi trips into the Kinesis data stream. 

The Kinesis data stream serves as a buffer that decouples the producers from the consumers. It is a common pattern for architectures that are analyzing streaming data to separate producers from consumers by means of a streaming store. In this way, the architecture becomes more robust. Producers and consumers can be scaled independently and producers can still persist events into the data stream even if the consumers are currently experiencing operational problems or the consuming application needs to be updated. 

This architecture also allows you to experiment and adopt new technologies in the future. Multiple independent applications can concurrently consume the data stored in the Kinesis data stream. You can then test how a new version of an existing application performs with a copy of the production traffic. But you can also introduce a different tool and technology stack to analyze the data, again without affecting the existing production application. 
