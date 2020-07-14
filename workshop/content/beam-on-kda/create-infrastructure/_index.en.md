+++
title = "Create Infrastructure"
date = 2020-07-10T10:14:06+02:00
weight = 40
chapter = true
+++

- create Kinesis stream
  - stream name:  beam-workshop
  - number shards: 4
- create Firehose delivery stream
  - delivery stream name: beam-workshop
  - source: kinesis data stream (beam-workshop)
  - transform source records
    - choose precreated lambda function (see cfn output `FirehoseTranformationLambda`)
    - there will be sevearl lambda functions, the one with EnrichEventsLambda in the name is the correct one
  - choose `historic-trip-events/` as a prefix
  - disable record format conversion
  - choose S3 bucket (see cfn output `S3Bucket`)
  - choose buffer size 60 sec
    - explain this is for the workshop, in general a larger value is more desirable
  - enable GZIP compression
- start replaying data into the Kinesis stream
  - open terminal in intellij
  - execute `java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-0.1.0.jar -streamName beam-workshop -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4/dropoff_year=2018/ -speedup 720`
