---
title: "Read parameters from Application Properties"
menuTitle: "Read parameters"
chapter: false
weight: 5
---

Eventually, we'd like to deploy the program to KDA. However, instead of logging in to a cluster and directly submitting a job to the Flink runtime, you upload the respective fat JAR to Amazon S3 and start the execution by calling an API. So we don't get access to the Flink cluster and we hence need to adapt the way we pass parameters to the Flink application.

If the Flink application is executed with Kinesis Data Analytics, we can obtain parameters from the Kinesis Analytics runtime. To this end, we can call the `KinesisAnalyticsRuntime.getApplicationProperties()` function to retrieve the parameters that are passed to the service through an API.

If the Flink application is executed in the local development environment, we continue to use the command line arguments that are specified when the `main` method is invoked.

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
    throw new RuntimeException("Unable to load FlinkApplicationProperties properties from the runtime.");
  }

  parameter = ParameterToolUtils.fromApplicationProperties(flinkProperties);
}
{{< / highlight >}}

