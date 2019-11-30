---
title: "Enable event time"
chapter: false
weight: 10
---

{{% notice info %}}
In the following steps, you are changing the source code of the Flink application. You only need to make chances to the `ProcessTaxiStreamLocal` class. But in case you have trouble completing the steps or get lost, you can refer to the final result in the `ProcessTaxiStream` class, and continue from there.
{{% /notice %}}

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

Extracting watermark information and generating watermarks is done with the `TimestampAssigner` class. The class is also responsible for assigning the correct time to individual events. Add the following `assignTimestampsAndWatermarks` statement right to the top of the existing definition of the `kinesisStream` in Line 84.

<!-- "linenos=table,linenostart=85" -->
{{< highlight java>}}
DataStream<TripEvent> trips = kinesisStream
    //extract watermarks from watermark events
    .assignTimestampsAndWatermarks(new TimestampAssigner())
    ...
{{< / highlight >}}

