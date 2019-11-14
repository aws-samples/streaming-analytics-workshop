---
title: "Execute the Flink program"
chapter: false
weight: 20
---

1. Click on **Project** in the upper left of the IntelliJ window

1. Navigate to and double click on the `ProcessTaxiStreamLocal` class by gruadually expanding the tree structure of the project: amazon-kinesis-analytics-taxi-consumer -> src -> main -> java -> com.amazonaws.samples.kaja.taxi.consumer

1. Start the execution of the program by clicking on the green arrow next to the `main` method and then choosing **Run**

	![](/images/intellij-4-execute-flink.png)

1. Once the Flink job has initialized, the `TaxiTripEvents` that are received from the Kinesis stream are displayed in the lower part of the IDE

	![](/images/intellij-5-execute-flink-output.png)
