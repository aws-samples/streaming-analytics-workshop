---
title: "Import dependency with Maven"
chapter: false
weight: 5
---

The Flink application is reading from a Kinesis stream, but the Flink Kinesis connector is currently not available from Maven central. The connector has already been compiled and loaded onto the EC2 instance for your convenience, but you still need to import it into the local Maven repository.

{{% notice info %}}
Starting with Flink 1.10, the Flink Kinesis connector will be available from Maven central. A CloudFormation template to build the Flink connector with CodePipeline for older Flink versions is available from [GitHub](https://github.com/aws-samples/amazon-kinesis-analytics-taxi-consumer/blob/master/cfn-templates/flink-kinesis-connector-build-pipeline.yml).
{{% /notice %}}

1. Click on **Maven** in the upper right corner of the IDE

1. Click on the **m** to execute the following Maven goal to import the missing Flink Kinesis connector dependency into the local maven repository

	```
install:install-file -Dfile=C:\Users\Administrator\Desktop\workshop-resources\flink-connector-kinesis_2.11-1.8.2.jar -DpomFile=C:\Users\Administrator\Desktop\workshop-resources\flink-connector-kinesis_2.11-1.8.2.pom.xml
	```

	![](/images/intellij-8-maven-install.png)

1. Refresh the project dependencies by right clicking on the `pom.xml` file and choosing **Maven** -> **Reimport**

	![](/images/intellij-12-pom-reimport.png)

After the reimport operation completed successful, all dependencies of the Flink application have been resolved and we can start developing and executing it. However, the Maven pane on the right hand side of Intellij may still display warnings for *amazon-kinesis-analytics-taxi-consumer*, which you can safely ignore.
