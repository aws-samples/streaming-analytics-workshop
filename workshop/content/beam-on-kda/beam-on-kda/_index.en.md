+++
title = "Beam on KDA"
date = 2020-07-10T10:27:19+02:00
weight = 45
chapter = false
+++

While running Apache Beam applications on top of Kinesis Data Analytics is no different from running Beam applications in any Apache Flink environment, there are a few important aspects that developers need to keep in mind.

## Passing parameters into the pipeline

Properties for your Kinesis Data Analytics application can be configured via the AWS console (or the CLI, CFN, Terraform, etc...):

![Overview BEAM Architecture](/images/beam-on-kda/beam-on-kda/beam-app-properties.png)

And these properties can be accessed from your code by extending [FlinkPipelineOptions](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/678096fcd8451f0d4d98871a3d3d97c63384d1fa/src/main/java/com/amazonaws/samples/beam/taxi/count/TaxiCountOptions.java#L31) as so:

```
...
public interface TaxiCountOptions extends FlinkPipelineOptions, AwsOptions {
  Logger LOG = LoggerFactory.getLogger(TaxiCountOptions.class);

  @Description("Name of the Kinesis Data Stream to read from")
  String getInputStreamName();

  void setInputStreamName(String value);


  @Description("S3 bucket name and prefix that contains the historic data")
  String getInputS3Pattern();

  void setInputS3Pattern(String value);


  @Default.String("kinesis")
  String getSource();

  void setSource(String value);


  @Default.Boolean(false)
  boolean getOutputBoroughs();

  void setOutputBoroughs(boolean value);


  static String[] argsFromKinesisApplicationProperties(String[] args, String applicationPropertiesName) {
    Properties beamProperties = null;

    try {
      Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
...
```

You'll notice the `KinesisAnalyticsRuntime` class above; in order to access this class in your code, be sure to add the following dependency in your pom.xml:

```
   <dependency>
      <groupId>com.amazonaws</groupId>
      <artifactId>aws-kinesisanalytics-runtime</artifactId>
      <version>${kda.version}</version>
    </dependency>
```

## Dependency Shading

When running your Beam applications on Kinesis Data Analytics, it's important to shade your dependencies to prevent dependency conflicts. Here's a [snippet](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/master/pom.xml#L196-L199) involving `jackson` from the taxi consumer sample:

```
...
      <relocation>
        <pattern>com.fasterxml.jackson</pattern>
        <shadedPattern>com.amazonaws.samples.beam.taxi.count.shaded.com.fasterxml.jackson</shadedPattern>
      </relocation>
...
```

## Configuring Credentials

You can configure your Beam IO connectors to pull credentials from the role that has been configured for the Kinesis Data Analytics application, instead of hard coding credentials in your code. Here's a snippet illustrating how to [configure the `KinesisIO` connector](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer/blob/678096fcd8451f0d4d98871a3d3d97c63384d1fa/src/main/java/com/amazonaws/samples/beam/taxi/count/TaxiCount.java#L70):

```
...
        input = p
            .apply("Kinesis source", KinesisIO
                .read()
                .withStreamName(options.getInputStreamName())
                .withAWSClientsProvider(new DefaultCredentialsProviderClientsProvider(Regions.fromName(options.getAwsRegion())))
                .withInitialPositionInStream(InitialPositionInStream.LATEST)
            )
            .apply("Parse Kinesis events", ParDo.of(new EventParser.KinesisParser()));
...
```
