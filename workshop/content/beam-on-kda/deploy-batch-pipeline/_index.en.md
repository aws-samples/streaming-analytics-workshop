+++
title = "Deploy Batch Pipeline"
date = 2020-07-10T10:27:27+02:00
weight = 70
chapter = false
+++

In the previous section, you have deployed a Beam application that is generating statistics on the number of incoming trips. At first the application only generated metrics for the entire city. This got then adapted to so that the application in now generating more fine grained metrics that are broken down per borough. 

However, the new metrics are only generated for newly arriving events. In this section, we will execute the Beam pipeline in a batch fashion on [Kinesis Data Analytics](https://aws.amazon.com/de/kinesis/data-analytics/) to backfill the metric with the historic data that has been persisted to Amazon S3.
