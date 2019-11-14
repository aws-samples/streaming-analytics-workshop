---
title: "Add time windows and aggregation"
chapter: false
weight: 20
---

We'd like to generate statistics about the incoming events. Sepcifically, we'd like to count how many trips are requested in a specific location to identify the most popular pickup locations and how long it takes on average to travel to the airports LaGuardia and JFK.


#### Count trips by pickup locations

To identify popular pickup locations, we'll generate a geo hash with a reduced precision and key by geo hashes. In this way, events in a similar geographic location will end up in the same key group. Finally, we use a time window of one hour (remember that this is according to event time, not actual processing time) and count the number of trips in the respective time window.

Add the following statement after the `print` statement in Line 94.

<!-- "linenos=table,linenostart=99" -->
{{< highlight java>}}
DataStream<PickupCount> pickupCounts = trips
    .map(new TripToGeoHash())
    .keyBy("geoHash")
    .timeWindow(Time.hours(1))
    .apply(new CountByGeoHash());

pickupCounts.print();
{{< / highlight >}}
    


#### Compute average trip durations to airports

To compute the average trip durations, we'll transform the incoming trip events and only emit `TripDuration` events for trips that arrive at one of the airports. Subsequently, we apply a time window of one hour and aggregate the duration of all `TripDuration` events in that time window that arrive to the same airport into an `AverageTripDuration` event.

Add this statement to the one you have just added in Line 97-103.

{{< highlight java>}}
DataStream<AverageTripDuration> tripDurations = trips
    .flatMap(new TripToTripDuration())
    .keyBy("pickupGeoHash", "airportCode")
    .timeWindow(Time.hours(1))
    .apply(new TripDurationToAverageTripDuration());
{{< / highlight >}}


#### Remove debug output

To verify that the computation is successful, you can comment out the debug output for `trips` in Line 94 and then restart the Flink program to inspect the output.

<!--"linenos=table,linenostart=96-->
{{< highlight java>}}
// trips.print();
{{< / highlight >}}

