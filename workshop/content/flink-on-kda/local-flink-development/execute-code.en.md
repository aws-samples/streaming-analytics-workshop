---
title: "Execute the Flink program"
chapter: false
weight: 20
---

Now that everything is set up correctly, you can execute the basic Flink program that has been cloned from the Github repository. It will simply read the events that have been sent to the Kinesis stream and print them on standard out.


1. Click on **Project** in the upper left of the IntelliJ window

1. Navigate to and double click on the `ProcessTaxiStreamLocal` class by gradually expanding the tree structure of the project: *amazon-kinesis-analytics-taxi-consumer* -> *src* -> *main* -> *java* -> *com.amazonaws.samples.kaja.taxi.consumer*

1. Start the execution of the program by clicking on the green arrow next to the `main` method and then choosing **Run**

	![](/images/flink-on-kda/intellij-4-execute-flink.png)

1. Once the Flink job has initialized, the *TripEvents* that are received from the Kinesis stream are displayed in the lower part of the IDE

	![](/images/flink-on-kda/intellij-5-execute-flink-output.png)

1. Stop the local execution of the Flink application by pressing the red square or by choosing *Run* -> *Stop* from the menu
