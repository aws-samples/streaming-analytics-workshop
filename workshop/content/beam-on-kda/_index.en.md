---
title: "Apache Beam on Amazon Kinesis Data Analytics"
menuTitle: "Apache Beam on KDA"
chapter: true
weight: 20
url: "/beam-on-kda/"
---

In this workshop, we explore an end to end example that combines batch and streaming aspects in one uniform Apache Beam pipeline. We start to analyze incoming taxi trip events in near real time with an Apache Beam pipeline. We then show how to archive the trip data to Amazon S3 for long term storage. We subsequently explain how to read the historic data from S3 and backfill new metrics by executing the same Beam pipeline in a batch fashion. Along the way, you also learn how you can deploy and execute the Beam pipeline with Amazon Kinesis Data Analytics in a fully managed environment.

![Overview Beam Architecture](/images/beam-on-kda/overview-beamarchitecture.png)

So you will not only learn how you can leverage Apache Beam’s expressive programming model to unify batch and streaming you will also learn how AWS can help you to effectively build and operate Beam based streaming architectures with low operational overhead.
