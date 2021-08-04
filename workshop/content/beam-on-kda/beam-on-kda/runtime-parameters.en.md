+++
title = "Passing runtime parameters into the pipeline"
menuTitle = "Runtime parameters"
date = 2020-07-10T10:27:19+02:00
weight = 10
chapter = false
+++

Amazon Kinesis Data Analytics (KDA) provides a managed Flink environment that is based on the open source Flink version. Hence, running a Beam pipeline on KDA is almost identical to running a Beam pipeline with a Flink runner on a self managed Flink cluster.

One of the differences is the way you pass runtime parameters into the pipeline. As you don't have access to the environment, you cannot specify parameters when you are invoking the Flink command. Instead, you can configure application properties, that get exposed to the application during runtime. You've already specified parameters through application properties when you created the KDA application.

In the Beam application, these properties are obtained from the environment.

{{< highlight java >}}
Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
{{< / highlight >}}

And then the properties are converted to a common `PipelineOption` with a [helper method](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/release-0.2.0/src/main/java/com/amazonaws/samples/beam/taxi/count/TaxiCountOptions.java#L60).

{{< highlight java >}}
String[] kinesisArgs = TaxiCountOptions.argsFromKinesisApplicationProperties(
    args, "BeamApplicationProperties");

TaxiCountOptions options = PipelineOptionsFactory.fromArgs(
    ArrayUtils.addAll(args, kinesisArgs)).as(TaxiCountOptions.class);

options.setRunner(FlinkRunner.class);
options.setAwsRegion(Regions.getCurrentRegion().getName());

PipelineOptionsValidator.validate(TaxiCountOptions.class, options);
{{< / highlight >}}


You'll notice the `KinesisAnalyticsRuntime` class above; in order to access this class in your code, be sure to add the following dependency in your `pom.xml`:

{{< highlight xml >}}
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-kinesisanalytics-runtime</artifactId>
    <version>${kda.version}</version>
</dependency>
{{< / highlight >}}
