---
title: "Read parameters from Application Properties"
chapter: false
weight: 40
---

Eventually, we'd like to deploy the program to KDA for Java Applications. However, instead of logging in to a cluster and directly submitting a job to the Flink runtime, you upload the respective fat JAR to S3. So we need to adapt the way we pass parameters to the Flink application.

Replace the code that reads parameters from the program `args` in Line 56 with the following code:

<!--"linenos=table,linenostart=56"-->
{{< highlight java >}}
ParameterTool parameter;

if (env instanceof LocalStreamEnvironment) {
  //read the parameters specified from the command line args
  parameter = ParameterTool.fromArgs(args);
} else {
  //read the parameters from the Kinesis Analytics environment
  Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();

  Properties flinkProperties = applicationProperties.get("FlinkApplicationProperties");

  if (flinkProperties == null) {
    throw new RuntimeException("Unable to load FlinkApplicationProperties properties from the Kinesis Analytics Runtime.");
  }

  parameter = ParameterToolUtils.fromApplicationProperties(flinkProperties);
}
{{< / highlight >}}

