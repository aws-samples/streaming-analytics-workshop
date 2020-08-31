---
title: "Build Beam Pipeline As Jar"
chapter: false
weight: 41
---

You first need to package the Flink application and all its dependencies into a Jar file that can be deployed to an Apache Flink environment.

1. You can see the Beam code in detail to see what we do with the data as we read it from the Kinesis stream.

1. Expand the Maven pane and click on the **m** to execute `clean package` as a Maven goal

   ![](/images/beam-on-kda/intellij-7-maven-package.png)

1. Maven will now build a jar file that includes all the dependencies of the Flink application. The jar file is stored in the **target** directory and can be deployed to Amazon Kinesis Data Analytics. Once built we can upload this jar file to Amazon S3. We have already done this for you in this workshop for a pre-built jar file.

	{{% notice info %}}
If you are feeling lucky, you can upload the generated jar file to an Amazon S3 bucket and subsequently deploy it to Amazon Kinesis Data Analytics. However, the following steps will use a precompiled jar file that is tested and works as intended.
{{% /notice %}}
