+++
title = "Deploy Streaming Pipeline"
date = 2020-07-10T10:27:19+02:00
weight = 50
chapter = true
+++

- explain important aspects of the beam pipeline; focus on things that are specific to kda
  - how are parameters passed to the pipeline
  - kda dependency in pom file
  - dpendency shading (check if still required)
- compile beam pipeline to jar file and upload it to s3
  - maybe use cdk/cfn bootstrap to have a precompiled version on s3 already?
- create kda application
  - `flink run -p 8 target/beam-taxi-count-*.jar --runner=FlinkRunner --inputS3Pattern=s3://beam-summit-bucket83908e77-4bgvbcf2qt1d/kinesis-stream-data/*/*/*/*/* --awsRegion=eu-west-1 --inputStreamName=beam-summit-InputStreamCFB159EA-1DHT32EAB5M54 --source=s3 --outputBoroughs=true`

  - BeamApplicationProperties
    - InputS3Pattern
    - s3://beam-summit-bucket83908e77-4bgvbcf2qt1d/kinesis-stream-data/*/*/*/*/*
    - Source
    - S3
