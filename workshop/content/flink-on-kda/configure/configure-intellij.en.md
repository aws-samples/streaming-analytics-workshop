---
title: "Configure Intellij"
chapter: false
weight: 40
---

Now that you have successfully connected to the Windows instance, the next step is to configure the development environment Intellij. This includes cloning the sources of the Flink application from [this Github repository](https://github.com/aws-samples/amazon-kinesis-analytics-taxi-consumer) that is used in the following steps to analyze the incoming taxi data in real time.

1. Double click on the Intellij icon on the Desktop

1. When prompted, do not import any settings, confirm that you have read and accept the terms of the User Agreement, and choose to send (or not to send, depending on your preference) user statistics

1. Accept the defaults by choosing **Skip Remaining and Set Defaults** in the Customize IntelliJ dialog

1. On the welcome screen, choose **Check out from Version Control** and **Git**

	![Lauch stack](/images/flink-on-kda/intellij-1-welcome.png)

1. In the clone repository dialog, insert `https://github.com/aws-samples/amazon-kinesis-analytics-taxi-consumer` as **URL** and confirm with **Clone**
	
	![Lauch stack](/images/flink-on-kda/intellij-2-clone.png)

1. When asked whether to open the IntelliJ IDEA project file, choose **Yes**. Note that, you will get a dependency failure after the completion of this step. This is expected and we have a remedy in the upcoming steps. For now move on to the next steps as the dependencies are being loaded.
