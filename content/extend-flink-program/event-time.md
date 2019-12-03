---
title: "Enable event time"
chapter: false
weight: 10
---

Using event time for window operators provides much more stable semantics compared to processing time, as it it more robust against reordering of events and late arriving events. To activate event time processing, we first need to configure the Flink execution environment appropriately.

{{< highlight java "linenos=inline,linenostart=75">}}
if (parameter.get("EventTime", "true").equals("true")) {
  env.setStreamTimeCharacteristic(TimeCharacteristic.EventTime);
}
{{< / highlight >}}

In addition to merely activating event time, we need to tell the Flink program, how it can extract the watermark information from the input stream. In this example, the stream contains special watermark events that inform the Flink runtime that all following events will have a timestamp larger than the current watermark.

Extracting watermark information and generating watermarks is done with the `TimestampAssigner` class. The class is also responsible for assigning the correct time to individual events. 

{{< highlight java "linenos=inline,linenostart=101">}}
DataStream<TripEvent> trips = kinesisStream
    //extract watermarks from watermark events
    .assignTimestampsAndWatermarks(new TimestampAssigner())
    ...
{{< / highlight >}}

