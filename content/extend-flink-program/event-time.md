---
title: "Enable event time"
chapter: false
weight: 10
---


#### Configure event time for the execution environment

To activate event time processing, we first need to configure the Flink execution environment appropriately. This is done by the following statement, that can be added at the beginning of the `ProcessTaxiStreamLocal` class after the `parameter` variable is initialized in Line 56.

<!-- "linenos=table,linenostart=60"-->

{{< highlight java>}}
if (parameter.get("EventTime", "true").equals("true")) {
  env.setStreamTimeCharacteristic(TimeCharacteristic.EventTime);
}
{{< / highlight >}}


#### Extract watermark information from watermark events

In addition, we need to tell the Flink program, how it can extract the watermark information from the input stream. In this example, the stream contains special watermark events that inform the Flink runtime that all following events will have a timestamp larger than the current watermark.

Extracting the watermarks is done with the `PunctuatedAssigner` class. Add the following `assignTimestampsAndWatermarks` statement right to the top of the existing definition of the `kinesisStream` in Line 84.

<!-- "linenos=table,linenostart=85" -->
{{< highlight java>}}
DataStream<TripEvent> trips = kinesisStream
    //extract watermarks from watermark events
    .assignTimestampsAndWatermarks(new PunctuatedAssigner())
    ...
{{< / highlight >}}

