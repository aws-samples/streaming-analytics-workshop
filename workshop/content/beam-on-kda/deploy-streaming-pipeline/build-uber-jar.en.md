---
title: "Build Beam Pipeline As Jar"
chapter: false
weight: 41
---

You first need to package the Flink application and all its dependencies into a Jar file that can be deployed to an Apache Flink environment.

1. Open a new **Terminal** window in Cloud9 IDE. Build the jar file by running the following commands in a terminal window from AWS Cloud9 development environment:
    {{< highlight bash >}}
cd code
mvn clean compile package
{{< / highlight >}}


1. Maven will now build a jar file that includes all the dependencies of the Flink application. The jar file is stored in the **target** directory and can be deployed to Amazon Kinesis Data Analytics. Once built we can upload this jar file to Amazon S3. We have already done this for you in this workshop for a pre-built jar file.

1. The build takes a couple of minutes to complete. The resulting jar file can be deployed on a Flink cluster and on Kinesis Data Analytics, respectively. For the purpose of this workshop, the jar has already been build and uploaded to S3, so you don't need to wait unitl the build completes.