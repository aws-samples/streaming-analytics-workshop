+++
title = "Beam on KDA"
date = 2020-07-10T10:27:19+02:00
weight = 45
chapter = true
+++

- explain important aspects of the beam pipeline; focus on things that are specific to kda
  - how are parameters passed to the pipeline
  - kda dependency in pom file
  - dpendency shading (check if still required)
- explain temporary credentials
- explain custom metrics

While running Beam applications on top of Kinesis Data Analytics for Apache Flink (KDA) is no different from running Beam applications in any Apache Flink environment, there are a few important aspects that developers need to keep in mind:

## Passing parameters into the pipeline

Properties for your KDA application can be configured via the AWS console (or the CLI, CFN, Terraform, etc...):

![Overview BEAM Architecture](/images/beam-on-kda/app-properties.png)

And these properties can be access from your code by extending FlinkPipelineOptions as so:

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