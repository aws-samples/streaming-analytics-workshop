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