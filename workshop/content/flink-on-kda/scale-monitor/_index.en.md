---
title: "Scale and Monitor"
chapter: false
weight: 70
---

Now that the KDA application is running and sending results to Elasticsearch, we'll take a look at operational aspects, such as monitoring and scaling.

Good operations is even more important for streaming applications that it is for batch based analytic applications. The throughput of incoming events is often substantially varying for these kind of applications. If the resources of the Flink application are not adapted accordingly, the application may fall substantially behind. It may then generate results that are no longer relevant as they are already too old when the overloaded application is eventually able to produce them.
