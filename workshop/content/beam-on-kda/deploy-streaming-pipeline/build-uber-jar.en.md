---
title: "Build Beam Pipeline As Jar"
chapter: false
weight: 41
---

You first need to package the Flink application and all its dependencies into a Jar file that can be deployed to an Apache Flink environment.

1. You can see the Beam code in detail to see what we do with the data as we read it from the Kinesis stream.

2. Open a new **Terminal** window in Cloud9 IDE. Build the jar file by running the following commands in a terminal window from AWS Cloud9 development environment:
    {{< highlight bash >}}
cd code
mvn clean compile package
{{< / highlight >}}


3. Maven will now build a jar file that includes all the dependencies of the Flink application. The jar file is stored in the **target** directory and can be deployed to Amazon Kinesis Data Analytics. Once built we can upload this jar file to Amazon S3. We have already done this for you in this workshop for a pre-built jar file.

	{{% notice info %}}
If you are feeling lucky, you can upload the generated jar file to an Amazon S3 bucket and subsequently deploy it to Amazon Kinesis Data Analytics. However, the following steps will use a precompiled jar file that is tested and works as intended.
{{% /notice %}}

4. You can copy the jar file to Amazon S3 from the terminal window of AWS Cloud9 development environment:
    {{< highlight bash >}}
aws s3 cp target/... 's3://...'
{{< / highlight >}}