---
title: "Debug Flink code"
chapter: false
weight: 30
---

In addition to simply executing the Flink application, you can also set breakpoints and debug the application locally, which is very convenient when implementing and verifying the business logic.

1. Expand the utils package and navigate to and double click the `GeoUtils` class

1. Set a breakpoint by clicking left of a code line, eg, Line 35

1. Start the debugging process by clicking the green bug next in the upper right corner of the IDE

	![](/images/flink-on-kda/intellij-6-debug.png)

1. Step through the code and inspect the content of the variables and the stack trace
