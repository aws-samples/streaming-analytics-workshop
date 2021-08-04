---
title: "Beam Pipeline Details"
chapter: false
weight: 10
---

Let's start with a quick look at the structure of the Beam pipeline and what it's trying to accomplish. The initial version of the Beam pipeline simply counts the incoming taxi trips in 5 second windows. To this end the pipeline (1) reads and parses the the data in the pipeline, (2) groups the events into 5 second windows, and (3) uses a global window to count the number of trips.

1. Read the data from the Kinesis data stream and parse it into `TripEvent`. By using the `DefaultCredentialsProviderClientsProvider`, the Kinesis source can automatically pick up temporary credentials from the KDA environment. In this way, credentials do not need to be hard coded into the application code.

    {{< highlight java >}}
input =
    p.apply(
            "Kinesis source",
            KinesisIO.read()
                .withStreamName(options.getInputStreamName())
                .withAWSClientsProvider(
                    new DefaultCredentialsProviderClientsProvider(Regions.fromName(options.getAwsRegion())))
                .withInitialPositionInStream(InitialPositionInStream.LATEST))
        .apply("Parse Kinesis events", ParDo.of(new EventParser.KinesisParser()));
{{< / highlight >}}

1. Group the `TripEvent` into 5 second windows. We are using a global window here, as we are interested in the total count of events. This, however, prevents the window operator from scaling out, which will be addressed by an update to the application.

    {{< highlight java >}}
PCollection<TripEvent> window =
    input.apply(
        "Group into 5 second windows",
        Window.<TripEvent>into(FixedWindows.of(Duration.standardSeconds(5)))
            .triggering(AfterWatermark.pastEndOfWindow())
            .withAllowedLateness(Duration.ZERO)
            .discardingFiredPanes());
{{< / highlight >}}

1. Finally, the events of each individual window are aggregated to determine the total trip count for this window. The result of the count operator is then converted to a `Metric`, which can be sent to Amazon CloudWatch for visualization.
    {{< highlight java >}}
metrics =
    window
        .apply(
            "Count globally",
            Combine.globally(Count.<TripEvent>combineFn()).withoutDefaults())
        .apply(
            "Map to Metric",
            ParDo.of(
                new DoFn<Long, Metric>() {
                    @ProcessElement
                    public void process(ProcessContext c) {
                        c.output(new Metric(c.element().longValue(), c.timestamp()));
                    }
                }));
{{< / highlight >}}

This was only a very brief overview of the Beam pipeline. If you are interested in learning more, you can navigate through the code on [GitHub](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/release-0.2.0/src/main/java/com/amazonaws/samples/beam/taxi/count/TaxiCount.java) or use the Cloud9 editor to explore the sources under `code/src/main/java/com/amazonaws/samples/beam/taxi/count/TaxiCount.java`. 