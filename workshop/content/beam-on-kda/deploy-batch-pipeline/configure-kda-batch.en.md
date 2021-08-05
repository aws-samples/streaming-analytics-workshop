+++
title = "Configure Beam pipeline in batch mode"
menuTitle = "Configure Beam pipeline"
date = 2020-07-10T10:27:27+02:00
weight = 20
+++


1. Navigate to the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation) and select the CloudFormation template that has been created for the workshop. Click on the **Outputs** tab and copy the value of the key *InputS3Pattern*. 

1. Then, navigate to the [Kinesis Data Analytics console](https://console.aws.amazon.com/kinesisanalytics/home#/applications/dashboard) and select the application you have created earlier

1. Press the blue **Configure** button next to the name of the application

1. Expand the properties section, select the **BeamApplicationProperties** group and click on **Edit group**

1. Change the value of *Source* to `s3`and add a row with the *Key* `InputS3Pattern` and value you have copied from the output section of the CloudFormation template.

	![KDA batch configuration](/images/beam-on-kda/kda-update-config-batch.png)

1. Confirm these changes by pressing **Save**. Apply the changes to the application by pressing **Update** at the bottom of the page.

Changing these options will change the source of the application, but it will leave the remaining code unchanged. Instead of reading events in a streaming fashion from a data stream, the aplication will now read the historic data set from Amazon S3.

{{< highlight java >}}
	input = p
		.apply("S3 source", TextIO
			.read()
			.from(options.getInputS3Pattern())
		)
		.apply("Parse S3 events",ParDo.of(new EventParser.S3Parser()));
{{< / highlight >}}

Once you have updated the settings, your application will be redeployed which takes 1-2 minutes.